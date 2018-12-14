const { h, makeDOMDriver } = require('@cycle/dom')
const { run } = require('@cycle/run')
const { dbDriver, filterDb } = require('./db')
const { banner, table, searchForm, editForm, debugStateView } = require('./view-partials')
const xs = require('xstream').default
const R = require('ramda')

const hintSymbol = Symbol('hint')
const ESC_KEY = 27
const DEBUG_STATE = false

// bootstrap:

function main(sources) {
  const initialDb$ = sources.db
  const actions = intent(sources.DOM)
  const state$ = model(actions, initialDb$).debug('state$')

  return {
    DOM: view(state$),
    db: updateDb(state$),
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
    editPatientIdx$: click('[data-action=edit]').map((ev) => parseInt(ev.target.dataset.id)),
    changeSearchTerm$: xs.merge(
      input('#searchTerm'),
      esc('#searchTerm').mapTo(''),
      click('#searchTermClear').mapTo(''),
    ),

    changeFirst$: input('input.edit-first'),
    changeLast$: input('input.edit-last'),
    changePesel$: input('input.edit-pesel'),
    changeLastVisit$: input('input.edit-lastVisit'),

    save$: click('button.save'),
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
  return initialDb$.map((patients) => {
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
        const len = state.patients.length
        const idx = parseInt(p.id) || len
        const patients = idx < len
          ? R.update(idx, p, state.patients)
          : R.append({ ...p, id: idx.toString() }, state.patients)
        return { ...state, patient: undefined, patients, [hintSymbol]: 'PATIENTS_UPDATED' }
      })
    )
    .fold((state, reducer) => reducer(dropHint(state)), initialState)
  }).flatten()

  function dropHint(state) {
    return { ...state, [hintSymbol]: undefined }
  }
}

function updateDb(state$) {
  return state$
    .filter(R.propEq(hintSymbol, 'PATIENTS_UPDATED'))
    .map(R.prop('patients'))
}

function view(state$) {
  return state$.map((state) => (
    h('div', [
      (state.patient ? editPage(state.patient) : searchPage(state)),
      (DEBUG_STATE ? debugStateView(state) : ''),
    ])
  ))

  function searchPage({ searchTerm, patients }) {
    const filtered = filterDb(patients, searchTerm)
    const noResults = filtered.length === 0
    return h('div', [
      banner('Browse patients'),
      searchForm(searchTerm, noResults),
      noResults ? '' : table(filtered),
    ])
  }

  function editPage(patient) {
    return h('div', [
      banner('Edit'),
      editForm(patient),
    ])
  }
}
