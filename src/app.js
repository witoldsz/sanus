const { h, makeDOMDriver } = require('@cycle/dom')
const { run } = require('@cycle/run')
const { dbDriver, filterAndSortPatients, updatePatients } = require('./db')
const { banner, table, searchForm, editForm, debugStateView } = require('./view-partials')
const { i18n } = require('./i18n')
const xs = require('xstream').default
const R = require('ramda')
const isPeselValid = require('pesel-check')

const hintSymbol = Symbol('hint')
const ESC_KEY = 27
const DEBUG_STATE = false

// bootstrap:

function main(sources) {
  const initialDb$ = sources.db
  const actions = intent(sources.DOM)
  const { state$, updatedPatients$ } = model(actions, initialDb$, sources.now)

  return {
    DOM: view(state$),
    db: updatedPatients$,
  }
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  db: dbDriver,
  now: (/* no sinks */) => () => new Date(),
}

run(main, drivers)

// application:

function intent(domSource) {
  return {
    newPatient: click('button#new-patient'),
    editPatientIdx$: click('[data-action=edit]').map((ev) => parseInt(ev.target.dataset.idx)),
    changeSearchTerm$: xs.merge(
      input('#searchTerm'),
      esc('#searchTerm').mapTo(''),
      click('#searchTermClear').mapTo(''),
    ),

    changeFirst$: input('input#edit-first'),
    changeLast$: input('input#edit-last'),
    changePesel$: input('input#edit-pesel'),
    changeLastVisit$: input('input#edit-lastVisit'),
    todayLastVisit$: click('button#today-lastVisit'),

    save$: click('button#save', { preventDefault: true }),
    overrideInvalid$: click('button#overrideInvalid', { preventDefault: true }),
    cancelPatient: xs.merge(
      click('button#cancel-patient', { preventDefault: true }),
      esc('form.edit'),
    ),
  }

  function input(selector) {
    return domSource.select(selector).events('input').map((ev) => ev.target.value)
  }

  function click(selector, opts) {
    return domSource.select(selector).events('click', opts)
  }

  function esc(selector) {
    return domSource.select(selector).events('keyup').filter(R.propEq('keyCode', ESC_KEY))
  }
}

function model(actions, initialDb$, now) {
  const state$ = initialDb$.map((patients) => {
    const initialState = {
      [hintSymbol]: undefined,
      patient: undefined,
      patients,
      searchTerm: '',
    }
    return xs.merge(
      actions.cancelPatient.map(() => R.assoc('patient', undefined)),
      actions.newPatient.map(() => R.assoc('patient', {})),
      actions.editPatientIdx$.map(idx => state => {
        const patient = state.patients[idx]
        return { ...state, patient }
      }),
      actions.changeSearchTerm$.map(R.assoc('searchTerm')),
      actions.changeFirst$.map(R.assocPath(['patient', 'firstName'])),
      actions.changeLast$.map(R.assocPath(['patient', 'lastName'])),
      actions.changePesel$.map(R.assocPath(['patient', 'pesel'])),
      xs.merge(
        actions.changeLastVisit$,
        actions.todayLastVisit$.map(now).map(d => d.toISOString().substr(0, 10)),
      ).map(R.assocPath(['patient', 'lastVisit'])),
      actions.overrideInvalid$.map(() => R.assocPath(['patient', '$invalidIgnored'], true)),
      actions.save$.map(() => state => {
        const p = validatePatient(state.patient)
        if (!p.firstName || !p.lastName) {
          return state
        } else if (p.$invalid && !p.$invalidIgnored) {
          return {
            ...state,
            patient: p,
          }
        } else {
          return {
            ...state,
            patient: undefined,
            patients: updatePatients(state.patients, { ...unvalidate(p), updatedTs: now().toISOString() }),
            [hintSymbol]: 'PATIENTS_UPDATED'
          }
        }
      })
    ).fold((state, reducer) => reducer(dropHint(state)), initialState)
  }).flatten()

  const updatedPatients$ = state$
    .filter(R.propEq(hintSymbol, 'PATIENTS_UPDATED'))
    .map(R.prop('patients'))

  return {
    state$,
    updatedPatients$,
  }

  function dropHint(state) {
    return { ...state, [hintSymbol]: undefined }
  }
}

function view(state$) {
  return state$.map((state) => (
    h('div', [
      (state.patient ? editPage(state.patient) : searchPage(state)),
      (DEBUG_STATE ? debugStateView(state) : ''),
    ])
  ))

  function searchPage({ searchTerm, patients }) {
    const filtered = filterAndSortPatients(patients, searchTerm)
    const resultsCount = filtered.length
    return h('div', [
      banner(i18n`Browse patients`),
      searchForm(searchTerm, resultsCount),
      resultsCount === 0 ? '' : table(filtered),
    ])
  }

  function editPage(patient) {
    return h('div', [
      banner(i18n`Edit`),
      editForm(patient),
    ])
  }
}

function validatePatient(p) {
  const $errors = {
    pesel: !isPeselValid(p.pesel),
  }
  return {
    ...p,
    $errors,
    $invalid: Object.entries($errors).filter(([_, val]) => val).length > 0,
  }
}

function unvalidate(validated) {
  const a = { ...validated }
  delete a.$errors
  delete a.$invalid
  delete a.$invalidIgnored
  return a
}
