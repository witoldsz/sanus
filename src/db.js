const xs = require('xstream').default
const fs = require('fs')
const path = require('path')
const R = require('ramda')

const PATIENTS_FILE = 'database.json'

exports.dbDriver = function(patients$) {
  patients$.addListener({ next: writeDb })
  return xs.of(readDb())

  function readDb() {
    console.log(path.relative('/', PATIENTS_FILE))
    return parse(fs.existsSync(PATIENTS_FILE) ? fs.readFileSync(PATIENTS_FILE, 'utf-8') : '[]')
  }

  function writeDb(db) {
    fs.writeFileSync(PATIENTS_FILE, serialize(db))
  }
}

/**
 * @param ps patients
 * @param term filtering term/search string
 */
exports.filterAndSortPatients = function(ps, term) {
  let filtered
  if (!term) {
    filtered = [...ps]
  } else if (term[0] >= '0' && term[0] <= '9') {
    filtered = ps.filter(({ pesel, lastVisit }) => pesel.startsWith(term) || lastVisit.startsWith(term))
  } else {
    const termsLowerCase = term.trim().toLocaleLowerCase()
    filtered = ps.filter(({ lastName, firstName }) =>
      `${lastName} ${firstName}`.toLocaleLowerCase().startsWith(termsLowerCase)
    )
  }
  return filtered.sort(({ updatedTs: t1 }, { updatedTs: t2 }) => t1 > t2 ? -1 : t1 < t2 ? 1 : 0)
}

/**
 * @param {Array} ps patients
 * @param {Object} p patient
 * @returns updated patients array
 */
exports.updatePatients = function(ps, p) {
  return typeof p.idx === 'number'
    ? R.update(p.idx, p, ps)
    : R.append({ ...p, idx: ps.length}, ps)
}

function serialize(db) {
  const rows = db.map((o) => [o.lastName, o.firstName, o.pesel, o.lastVisit, o.updatedTs])
  return JSON.stringify(rows).replace(/\],/g, '],\n')
}

function parse(fileContent) {
  return JSON.parse(fileContent).map((arr, idx) => ({
    idx,
    lastName: arr[0],
    firstName: arr[1],
    pesel: arr[2],
    lastVisit: arr[3],
    updatedTs: arr[4] || '',
  }))
}