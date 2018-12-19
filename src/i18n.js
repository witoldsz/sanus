const { pathOr } = require('ramda')

const lang = 'en' // TODO: detect or let user set and persist

exports.i18n = function([key]) {
  return lang === 'en' ? key : pathOr(key, [key, lang], translations)
}

const translations = {
  'Patients database': {
    pl: 'Baza pacjentów'
  },
  'no results': {
    pl: 'brak wyników'
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
  }
}
