export interface ClauseTemplate {
  id: string;
  label: string;
  defaultText: string;
  defaultEnabled: boolean;
}

export const CLAUSE_TEMPLATES: ClauseTemplate[] = [
  {
    id: "maintenance",
    label: "Maintenance Charges",
    defaultText:
      "The Tenant shall pay the monthly society maintenance charges directly to the housing society. Major structural repairs shall be borne by the Owner.",
    defaultEnabled: true,
  },
  {
    id: "utilities",
    label: "Electricity & Water Charges",
    defaultText:
      "The Tenant shall be responsible for the payment of all electricity and water bills associated with the premises during the tenancy.",
    defaultEnabled: true,
  },
  {
    id: "notice",
    label: "Notice Period for Vacating",
    defaultText:
      "Either party may terminate this agreement by giving the other party not less than the agreed notice period in writing.",
    defaultEnabled: true,
  },
  {
    id: "alterations",
    label: "No Structural Alterations",
    defaultText:
      "The Tenant shall not make any structural alterations, additions or changes to the property without the prior written consent of the Owner.",
    defaultEnabled: true,
  },
  {
    id: "subletting",
    label: "No Subletting",
    defaultText:
      "The Tenant shall not sublet, assign or part with possession of the property or any part thereof to any third party.",
    defaultEnabled: true,
  },
  {
    id: "inspection",
    label: "Right of Inspection",
    defaultText:
      "The Owner or their authorised representative shall have the right to inspect the property at reasonable times after giving 24 hours' prior notice to the Tenant.",
    defaultEnabled: true,
  },
  {
    id: "lawful-use",
    label: "Lawful Use of Premises",
    defaultText:
      "The Tenant shall use the premises only for lawful residential purposes and shall not engage in any illegal or commercial activities on the premises.",
    defaultEnabled: true,
  },
  {
    id: "jurisdiction",
    label: "Jurisdiction & Governing Law",
    defaultText:
      "This agreement shall be governed by the laws of India. Any dispute arising out of or in connection with this agreement shall be subject to the exclusive jurisdiction of the courts in the city where the property is situated.",
    defaultEnabled: true,
  },
  {
    id: "painting-cleaning",
    label: "Painting & Cleaning Charges",
    defaultText:
      "On conclusion of the agreement and vacating the premises, the Tenant has agreed to a deduction of one (1) month's license fees from the deposit towards painting and cleaning charges.",
    defaultEnabled: false,
  },
  {
    id: "property-condition",
    label: "Property Condition Upon Vacating",
    defaultText:
      "Upon vacating the premises, the Tenant is required to return the property in a clean condition, similar to the condition at move-in. If the Owner deems that the premises require additional cleaning or repainting beyond normal wear and tear, the associated costs will be deducted from the deposit.",
    defaultEnabled: false,
  },
  {
    id: "furniture-no-alteration",
    label: "Furniture — No Alteration",
    defaultText:
      "The Tenant shall not make any alterations to the furniture, including but not limited to painting, reupholstering or disassembling, without the Owner's written consent.",
    defaultEnabled: false,
  },
  {
    id: "furniture-damages",
    label: "Furniture & Damages",
    defaultText:
      "In the event of damage caused by the Tenant, the Tenant shall be liable for the cost of repair or replacement of the damaged furniture or furnishings.",
    defaultEnabled: false,
  },
  {
    id: "deposit-deductions",
    label: "Refundable Deposit — Deductions",
    defaultText:
      "The Owner may deduct reasonable cleaning and painting costs from the Tenant's security deposit if the premises are not returned in a satisfactory condition.",
    defaultEnabled: false,
  },
  {
    id: "security-illegal-activity",
    label: "Security — Illegal Activity",
    defaultText:
      "This Agreement may be cancelled immediately by the Owner if the Tenant is found guilty of conducting any illegal activity on the premises.",
    defaultEnabled: true,
  },
  {
    id: "pets",
    label: "Pets — Consent",
    defaultText:
      "The Tenant agrees that no additional pets will be kept on the premises without the Owner's prior written consent.",
    defaultEnabled: false,
  },
  {
    id: "pets-damages",
    label: "Pets — Damages",
    defaultText:
      "The Tenant shall be liable for any damage caused by the pet to the premises, including but not limited to chewing, scratching or soiling, and agrees to repair such damage at their own expense.",
    defaultEnabled: false,
  },
  {
    id: "gst-prohibition",
    label: "Prohibition on GST Registration",
    defaultText:
      "The Tenant shall not use the premises to obtain or register for Goods and Services Tax (GST), nor represent it as their principal place of business for GST purposes, without prior written consent from the Owner. Any such action shall constitute a material breach and may lead to immediate termination of this Agreement.",
    defaultEnabled: false,
  },
];
