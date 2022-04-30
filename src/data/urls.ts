const Urls = {
  usTaxes: {
    start: '/start'
  },
  taxPayer: {
    root: '/taxpayer',
    info: '/info',
    spouseAndDependent: '/spouseanddependent'
  },
  refund: '/refundinfo',
  questions: '/questions',
  income: {
    w2s: '/income/w2jobinfo',
    f1099s: '/income/f1099s',
    realEstate: '/income/realestate',
    otherInvestments: '/income/otherinvestments'
  },
  payments: {
    estimatedTaxes: '/payments/estimatedtaxes'
  },
  savingsAccounts: {
    healthSavingsAccounts: '/savingsaccounts/hsa'
  },
  deductions: {
    f1098es: '/deductions/studentloaninterest'
  },
  credits: {
    main: '/credits',
    eic: '/credits/eic'
  },
  createPdf: '/createpdf',
  settings: '/settings',
  default: '',
  stateQuestions: '/statequestions',
  orforms: {
    orwfhdc: '/state/oregon/orwfhdc'
  }
}

Urls.default = Urls.usTaxes.start

export default Urls
