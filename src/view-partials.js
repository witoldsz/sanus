const { h } = require('@cycle/dom')
const { i18n } = require('./i18n')

const MAX_ITEMS = 200

exports.banner = function (title) {
  return h('div.mw7 center ph3 ph5-ns tc br2 pv2 bg-washed-green dark-green mb2', [
    h('h1.fw6 f3 f2-ns lh-title mt0 mb3', [
      i18n`Patients database`
    ]),
    h('h2.fw2 f4 lh-copy mt0 mb3', [title]),
  ])
}

exports.searchForm = function (searchTerm, resultsCount) {
  return h('div.flex justify-center', [
    h('div.w-100 measure', [
      h('div.ba br--black relative', [
        h('input#searchTerm.input-reset bn bg-transparent pa2 pr4 w-100', {
          props: {
            type: 'text',
            value: searchTerm,
            placeholder: i18n`enter last and first name or PESEL or last visit date`
          },
          hook: focusHook(),
        }),
        h('button#searchTermClear.absolute right-0 pa2 button-reset bn bg-transparent pointer', ['⨯']),
      ]),
      h('small.db pa2', { class: { 'red': resultsCount === 0 } }, [
        resultsCount === 0 ? i18n`no results` : '',
        resultsCount > 0 ? `${i18n`records`}: ${resultsCount}` : '',
        resultsCount > MAX_ITEMS ? ` (${i18n`showing first`} ${MAX_ITEMS})` : '',
        ' ',
        resultsCount > 0 ? i18n`Table sorted by most recent edit.` : '',
      ]),
    ]),
    h('div', [
      h('button#new-patient.button-reset b grow ba b--black br-pill br-black ml2 pa2 bg-transparent pointer', [
        i18n`new patient`
      ])
    ]),
  ])
}

exports.table = function (patients) {
  return h('div.pa4', [
    h('div.overflow-auto', [
      h('table', { props: { className: 'w-100 mw8 center' }, attrs: { cellspacing: '0' } }, [
        h('thead', [
          h('tr', [
            h('th.fw6 bb b--black-20 tl pb3 pr3 bg-transparent', [i18n`Last name`]),
            h('th.fw6 bb b--black-20 tl pb3 pr3 bg-transparent', [i18n`First name`]),
            h('th.fw6 bb b--black-20 tl pb3 pr3 bg-transparent', [i18n`PESEL`]),
            h('th.fw6 bb b--black-20 tl pb3 pr3 bg-transparent', [i18n`Last visit`]),
          ])
        ]),
        h('tbody.lh-copy', patients.slice(0, MAX_ITEMS).map((patient) =>
          h('tr', { key: patient.idx }, [
            h('td.pv3 pr3 bb b--black-20', [lnk(patient, 'lastName')]),
            h('td.pv3 pr3 bb b--black-20', [lnk(patient, 'firstName')]),
            h('td.pv3 pr3 bb b--black-20', [lnk(patient, 'pesel')]),
            h('td.pv3 pr3 bb b--black-20', [lnk(patient, 'lastVisit')]),
          ])
        )),
      ])
    ])
  ])

  function lnk(patient, prop) {
    return h('span', {
      props: { className: 'link hover-dark-blue pointer underline-hover' },
      dataset: { idx: `${patient.idx}`, action: 'edit' }
    }, [patient[prop]])
  }
}

exports.editForm = function (patient) {
  const saveable = !patient.$invalid || patient.$invalid && patient.$invalidIgnored
  return h('form.edit measure center black-80', [
    h('fieldset.ba b--transparent ph0 mh0', [
      field(i18n`Last name`, undefined, 'edit-last', 'lastName', true),
      field(i18n`First name`, undefined, 'edit-first', 'firstName'),
      field(i18n`PESEL`, i18n`PESEL is invalid`, 'edit-pesel', 'pesel'),

      h('div.mt3', [
        h('label.db fw4 lh-copy', [i18n`Last visit`, ' ', h('small', [i18n`year-month-day`])]),
        h('div.relative ba b--light-silver', [
          h(`input#edit-lastVisit.pa2 input-reset bn bg-transparent w-100`, {
            props: { type: 'text', value: patient.lastVisit },
          }),
          h('button#today-lastVisit.absolute right-0 top-0 pa2 button-reset pointer bn bg-transparent', {
            props: { type: 'button' }
          }, [i18n`today`]),
        ]),
      ]),

      h('div.mt3', [
        h('button#save.b ph3 pv2 input-reset ba b--dark-green dark-green bg-washed-green grow pointer',
          {
            class: {
              'bg-washed-green': saveable,
              'bg-washed-red': !saveable,
            },
            props: { type: 'submit' }
          },
          [i18n`save`]
        ),
        h('button#overrideInvalid.ml2 bn bg-transparent pointer grow',
          {
            class: { 'dn': !patient.$invalid || patient.$invalidIgnored },
            props: { type: 'button' }
          },
          ['✔ ', i18n`ignore invalid form`]
        ),
        h('button#cancel-patient.fr ml3 b ph3 pv2 input-reset ba b--light-silver bg-transparent grow pointer',
          { props: { type: 'button' } },
          [i18n`cancel`]
        ),
      ]),
    ])
  ])

  function field(label, errorLabel, action, valueKey, focus = false) {
    const hasError = patient.$errors && patient.$errors[valueKey]
    return h('div.mt3', [
      hasError
        ? h('label.db fw4 lh-copy red', [errorLabel])
        : h('label.db fw4 lh-copy', [label]),
      h(`input#${action}.pa2 input-reset ba b--light-silver bg-transparent w-100`, {
        props: { type: 'text', value: patient[valueKey] },
        hook: focus ? focusHook() : undefined,
      }),
    ])
  }
}

exports.debugStateView = function (state) {
  return h('div', [
    h('hr'),
    h('pre', [JSON.stringify(state, null, 2)]),
  ])
}

function focusHook() {
  return {
    insert(vnode) {
      vnode.elm.focus()
    }
  }
}