const { pathOr } = require('ramda')
const electron = require('electron')

const argv = electron.remote.process.argv // ['_app', 'path', 'lang=X']

const lang = argv.filter((e) => e.startsWith('lang=')).map(e => e.replace('lang=', ''))[0]

exports.i18n = function([key]) {
  return pathOr(key, [key, lang], translations)
}

const translations = {
  'Patients database': {
    pl: 'Baza pacjentów'
  },
  'no results': {
    pl: 'brak wyników'
  },
  'records': {
    pl: 'rekordów'
  },
  'showing first': {
    pl: 'pokazuję pierwsze'
  },
  'Table sorted by most recent edit.': {
    pl: 'Tabela sortowana wg daty edycji.'
  },
  'Browse patients': {
    pl: 'Przeglądaj listę pacjentów'
  },
  'enter last and first name or PESEL or last visit date': {
    pl: 'nazwisko i imię lub PESEL lub data ostatniej wizyty'
  },
  'new patient': {
    pl: 'nowy pacjent'
  },
  'Last name': {
    pl: 'Nazwisko'
  },
  'First name': {
    pl: 'Imie'
  },
  'PESEL': {
    pl: 'PESEL'
  },
  'Last visit': {
    pl: 'Ost. wizyta'
  },
  'Edit': {
    pl: 'Edycja'
  },
  'save': {
    pl: 'zapisz'
  },
  'cancel': {
    pl: 'anuluj'
  },
  'today': {
    pl: 'dziś'
  },
  'year-month-day': {
    pl: 'rok-mies-dzień'
  },
  'invalid': {
    pl: 'nieprawidłowy'
  },
  'invalid date format': {
    pl: 'nieprawidłowa data'
  },
  'ignore invalid form': {
    pl: 'ignoruj błędy formularza'
  }
}
