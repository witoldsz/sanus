const { h, makeDOMDriver } = require('@cycle/dom')
const { run } = require('@cycle/run')
const { dbDriver, filterPatients, updatePatients } = require('./db')
const { banner, table, searchForm, editForm, debugStateView } = require('./view-partials')
const { i18n } = require('./i18n')
const xs = require('xstream').default
const R = require('ramda')

const hintSymbol = Symbol('hint')
const ESC_KEY = 27
const DEBUG_STATE = false

// bootstrap:

function main(sources) {
  const initialDb$ = sources.db
  const actions = intent(sources.DOM)
  const { state$, updatedPatients$ } = model(actions, initialDb$)

  return {
    DOM: view(state$),
    db: updatedPatients$,
  }
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  db: dbDriver,
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

    changeFirst$: input('input.edit-first'),
    changeLast$: input('input.edit-last'),
    changePesel$: input('input.edit-pesel'),
    changeLastVisit$: input('input.edit-lastVisit'),

    save$: click('button.save', { preventDefault: true }),
    cancelPatient: xs.merge(
      click('button.cancel-patient', { preventDefault: true }),
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

function model(actions, initialDb$) {
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
      actions.changeLastVisit$.map(R.assocPath(['patient', 'lastVisit'])),
      actions.save$.map(() => state => {
        const p = state.patient
        if (!p.firstName || !p.lastName) {
          return state
        } else {
          return {
            ...state,
            patient: undefined,
            patients: updatePatients(state.patients, p),
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
    const filtered = filterPatients(patients, searchTerm)
    const noResults = filtered.length === 0
    return h('div', [
      banner(i18n`Browse patients`),
      searchForm(searchTerm, noResults),
      noResults ? '' : table(filtered),
    ])
  }

  function editPage(patient) {
    return h('div', [
      banner(i18n`Edit`),
      editForm(patient),
    ])
  }
}
