const { h } = require('@cycle/dom')

exports.banner = function (title) {
  return h('div.mw7 center ph3 ph5-ns tc br2 pv2 bg-washed-green dark-green mb2', [
    h('h1.fw6 f3 f2-ns lh-title mt0 mb3', [
      'Patients database'
    ]),
    h('h2.fw2 f4 lh-copy mt0 mb3', [title]),
  ])
}

exports.searchForm = function (searchTerm, noResults) {
  return h('div.measure center', [
    h('div.ba', [
      h('input', {
        attrs: { id: 'searchTerm' },
        props: {
          className: 'input-reset bn bg-white pa2 w-90',
          value: searchTerm,
          placeholder: 'enter last and first name or PESEL or last visit date'
        },
        hook: focusHook(),
      }),
      h('button', {
        attrs: { id: 'searchTermClear' },
        props: {
          className: 'button-reset bn bg-white w-9 pointer'
        }
      }, ['⨯']),
    ]),
    h('small.red db pa2', { class: { 'o-0': !noResults }}, ['no results'])
  ])
}

exports.table = function (patients) {
  return h('div.pa4', [
    h('div.overflow-auto', [
      h('table', { props: { className: 'w-100 mw8 center' }, attrs: { cellspacing: '0' } }, [
        h('thead', [
          h('tr', [
            h('th.fw6 bb b--black-20 tl pb3 pr3 bg-white', ['Last name']),
            h('th.fw6 bb b--black-20 tl pb3 pr3 bg-white', ['First name']),
            h('th.fw6 bb b--black-20 tl pb3 pr3 bg-white', ['PESEL']),
            h('th.fw6 bb b--black-20 tl pb3 pr3 bg-white', ['Last visit']),
          ])
        ]),
        h('tbody.lh-copy', patients.map((patient) => h('tr', [
          h('td.pv3 pr3 bb b--black-20', [lnk(patient, 'lastName')]),
          h('td.pv3 pr3 bb b--black-20', [lnk(patient, 'firstName')]),
          h('td.pv3 pr3 bb b--black-20', [lnk(patient, 'pesel')]),
          h('td.pv3 pr3 bb b--black-20', [lnk(patient, 'lastVisit')]),
        ]))),
      ])
    ])
  ])

  function lnk(patient, prop) {
    return h('span', {
      props: { className: 'link hover-dark-blue pointer underline-hover' },
      dataset: { id: patient.id, action: 'edit' }
    }, [patient[prop]])
  }
}

exports.editForm = function (patient) {
  return h('form.edit measure center black-80', [
    h('fieldset.ba b--transparent ph0 mh0', [
      field('Last name:', 'edit-last', patient.lastName, true),
      field('First name:', 'edit-first', patient.firstName),
      field('PESEL', 'edit-pesel', patient.pesel),
      field('Last visit:', 'edit-lastVisit', patient.lastVisit),

      h('div.mt3', [
        h('button.save b ph3 pv2 input-reset ba b--dark-green dark-green bg-washed-green grow pointer',
          { attrs: { type: 'submit' } },
          ['save']
        ),
        h('button.cancel-patient ml3 b ph3 pv2 input-reset ba b--light-silver bg-transparent grow pointer',
          { attrs: { type: 'button' } },
          ['cancel']
        ),
      ]),
    ])
  ])

  function field(label, action, value, focus = false) {
    return h('div.mt3', [
      h('label.db fw4 lh-copy', [label]),
      h(`input.${action} pa2 input-reset ba b--light-silver bg-transparent w-100 measure`, {
        props: { value },
        hook: focus ? focusHook() : undefined,
      }),
    ])
  }
}

function focusHook() {
  return {
    insert(vnode) {
      vnode.elm.focus()
    }
  }
}