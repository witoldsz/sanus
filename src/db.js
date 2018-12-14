const xs = require('xstream').default
const fs = require('fs')
const path = require('path')

const PATIENTS_FILE = 'database.json'

exports.dbDriver = function(patients$) {
  patients$.addListener({ next: writeDb })
  return xs.of(readDb())
}

function readDb() {
  console.log(path.relative('/', PATIENTS_FILE))
  return parse(fs.existsSync(PATIENTS_FILE) ? fs.readFileSync(PATIENTS_FILE, 'utf-8') : '[]')
}

function writeDb(db) {
  fs.writeFileSync(PATIENTS_FILE, serialize(db))
}

exports.filterDb = function(db, term) {
  if (!term) {
    return db
  } else if (term[0] >= '0' && term[0] <= '9') {
    return db.filter(({ pesel, lastVisit }) => pesel.startsWith(term) || lastVisit.startsWith(term))
  } else {
    const termsLowerCase = term.trim().toLocaleLowerCase()
    return db.filter(({ lastName, firstName }) =>
      `${lastName} ${firstName}`.toLocaleLowerCase().startsWith(termsLowerCase)
    )
  }
}

function serialize(db) {
  const rows = db.map((o) => [o.lastName, o.firstName, o.pesel, o.lastVisit])
  return JSON.stringify(rows).replace(/\],/g, '],\n')
}

function parse(fileContent) {
  return JSON.parse(fileContent).map((arr, id) => ({
    id: id.toString(),
    lastName: arr[0],
    firstName: arr[1],
    pesel: arr[2],
    lastVisit: arr[3],
  }))
}