import F1040Attachment from './F1040Attachment'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { netInvestmentIncomeTax } from '../data/federal'
import { Field } from 'ustaxes/core/pdfFiller'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'

export const needsF8960 = (state: ValidatedInformation): boolean => {
  const filingStatus = state.taxPayer.filingStatus
  const totalW2Income = state.w2s
    .map((w2) => w2.income)
    .reduce((l, r) => l + r, 0)
  return netInvestmentIncomeTax.taxThreshold(filingStatus) < totalW2Income
}

export default class F8960 extends F1040Attachment {
  tag: FormTag = 'f8960'
  sequenceIndex = 72

  //Taxable Interest
  l1 = (): number | undefined => this.f1040.l2b()

  // Ordinary Dividends
  l2 = (): number | undefined => this.f1040.l3b()
  /* Enter the gross income from all annuities, except annuities paid from the following.

    - Section 401—Qualified pension, profit-sharing, and stock bonus plans.
    - Section 403(a)—Qualified annuity plans purchased by an employer for an employee.
    - Section 403(b)—Annuities purchased by public schools or section 501(c)(3) tax-exempt organizations.
    - Section 408—Individual Retirement Accounts (IRAs) or Annuities.
    - Section 408A—Roth IRAs.
    - Section 457(b)—Deferred compensation plans of a state and local government and tax-exempt organization.
    - Amounts paid in consideration for services (for example, distributions from a foreign retirement plan that 
    are paid in the form of an annuity and include investment income that was earned by the retirement plan).

    How your annuities are reported to you. Net investment income from annuities is reported to a recipient on 
    Form 1099-R, Distributions From Pensions, Annuities, Retirement or Profit-Sharing Plans, IRAs, Insurance 
    Contracts, etc. However, the amount reported on Form 1099-R may also include annuity payments from 
    retirement plans that are exempt from NIIT. Amounts subject to NIIT should be identified with code "D" in box 7. 
    If code "D" is shown in box 7 of Form 1099-R, include on Form 8960, line 3, the taxable amount reported 
    on Form 1099-R, box 2a. However, if the payor checks box 2b indicating the taxable amount can’t be determined, 
    you may need to calculate the taxable portion of your distribution. See Pub. 939, General Rule for Pensions 
    and Annuities, and Pub. 575, Pension and Annuity Income, for details.
  */
  l3 = (): number | undefined => undefined
  /* Rental Real Estate, Royalties, Partnerships, S Corporations, and Trusts
      Enter the following amount from your properly completed return.

      - Schedule 1 (Form 1040), line 5.
      - Form 1041, line 5.
      - Form 1041-QFT, the portion of line 4 that’s income and loss that properly 
      would be reported by a trust filing Form 1041 on Form 1041, line 5.
      - Form 1040-NR, the amount properly reported on the attachment to your Form 1040-NR
      representing the amount that you would properly include on Schedule 1 (Form 1040), line 5, 
      if you were filing Form 1040 or 1040‐SR and including income and loss only for your period of U.S. residency.
  */
  l4a = (): number | undefined => this.f1040.schedule1?.l5()

  l4b = (): number | undefined => undefined

  l4c = (): number => sumFields([this.l4a(), this.l4b()])

  // Line 5a-5d: Gains and Losses on the Disassets of Property
  l5a = (): number => sumFields([this.f1040.l7(), this.f1040.schedule1?.l4()])
  // TODO: implement line 5b and 5c from worksheet.
  l5b = (): number | undefined => undefined
  l5c = (): number | undefined => undefined
  l5d = (): number => sumFields([this.l5a(), this.l5b(), this.l5c()])

  // TODO: Line 6: Adjustments to Investment Income for Certain CFCs and PFICs
  l6 = (): number | undefined => undefined

  // TODO: Line 7: Other Modifications to Investment Income
  l7 = (): number | undefined => undefined

  l8 = (): number =>
    sumFields([
      this.l1(),
      this.l2(),
      this.l3(),
      this.l4c(),
      this.l5d(),
      this.l6(),
      this.l7()
    ])
  // Todo: Implement Schedule A
  l9a = (): number | undefined => this.f1040.scheduleA?.l9()
  // Line 9b Reasonable method: Total state tax from W2 * Form 8960 Line 8 / 1040 Line 11, Adjusted gross income
  l9b = (): number | undefined => {
    const totalStateWithholding = this.f1040
      .validW2s()
      .map((w2) => w2.stateWithholding ?? 0)
      .reduce((l, r) => l + r, 0)
    const f1040L11 = this.f1040.l11()
    if (f1040L11 === 0) {
      return 0
    }
    return (totalStateWithholding * this.l8()) / f1040L11
  }
  l9c = (): number | undefined => undefined
  l9d = (): number => sumFields([this.l9a(), this.l9b(), this.l9c()])
  l10 = (): number | undefined => undefined
  l11 = (): number => sumFields([this.l9d(), this.l10()])

  l12 = (): number => Math.max(0, this.l8() - this.l11())

  // TODO: This should also take into account values on form 2555 and adjustments for Certain CFCs and Certain PFICs
  l13 = (): number => this.f1040.l11()

  l14 = (): number =>
    netInvestmentIncomeTax.taxThreshold(this.f1040.info.taxPayer.filingStatus)

  l15 = (): number => Math.max(0, this.l13() - this.l14())
  l16 = (): number => (this.l12() < this.l15() ? this.l12() : this.l15())

  l17 = (): number => Math.round(this.l16() * netInvestmentIncomeTax.taxRate)

  // TODO: Estates and Trusts
  // leave all of the following undefined until we support estates and trusts
  // these lines are to be left blank for individuals
  l18a = (): number | undefined => undefined
  l18b = (): number | undefined => undefined
  l18c = (): number | undefined => undefined

  l19a = (): number | undefined => undefined
  l19b = (): number | undefined => undefined
  l19c = (): number | undefined => undefined

  l20 = (): number | undefined => undefined // this.l19c() < this.l18c()? this.l19c() : this.l18c()
  l21 = (): number | undefined => undefined // Math.round(this.l20() * netInvestmentIncomeTax.taxRate)

  toSchedule2l12 = (): number | undefined => this.l17()

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    undefined, // Section 6013(g) election checkbox
    undefined, // Section 6013(h) election checkbox
    undefined, // Regulations section 1.1411-10(g) election checkbox
    this.l1(),
    this.l2(),
    this.l3(),
    this.l4a(),
    this.l4b(),
    this.l4c(),
    this.l5a(),
    this.l5b(),
    this.l5c(),
    this.l5d(),
    this.l6(),
    this.l7(),
    this.l8(),
    this.l9a(),
    this.l9b(),
    this.l9c(),
    this.l9d(),
    this.l10(),
    this.l11(),
    this.l12(),
    this.l13(),
    this.l14(),
    this.l15(),
    this.l16(),
    this.l17(),
    this.l18a(),
    this.l18b(),
    this.l18c(),
    this.l19a(),
    this.l19b(),
    this.l19c(),
    this.l20(),
    this.l21()
  ]
}
