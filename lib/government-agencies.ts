import { DISTRICTS, LOCAL_UNITS, PROVINCES, type DistrictDef, type LocalUnitDef, type ProvinceDef } from './geo-constants'

export type AgencyLevel = 'federal' | 'provincial' | 'district' | 'palika'

export type AgencyCategory =
  | 'ministry'
  | 'constitutional'
  | 'administration'
  | 'security'
  | 'judiciary'
  | 'revenue'
  | 'health'
  | 'infrastructure'
  | 'local_government'
  | 'utility'

export type GovernmentAgency = {
  id: string
  name: string
  nameNe: string
  acronym?: string
  category: AgencyCategory
  categoryLabel: string
  level: AgencyLevel
  province?: string
  district?: string
  palika?: string
  address: string
  phone?: string
  email?: string
  website?: string
  mapUrl?: string
  services: string[]
  description: string
  lat?: number
  lon?: number
}

export const CATEGORY_LABELS: Record<AgencyCategory, string> = {
  ministry: 'Ministry & Central Executive',
  constitutional: 'Constitutional Body',
  administration: 'Administration & Public Services',
  security: 'Law Enforcement & Security',
  judiciary: 'Courts & Judiciary',
  revenue: 'Tax, Customs & Land Revenue',
  health: 'Health & Medical Services',
  infrastructure: 'Infrastructure & Transport',
  local_government: 'Local Government & Palika',
  utility: 'Public Utilities & Energy',
}

export const CATEGORY_ORDER: AgencyCategory[] = [
  'administration',
  'local_government',
  'security',
  'judiciary',
  'revenue',
  'health',
  'ministry',
  'constitutional',
  'infrastructure',
  'utility',
]

// 1. Core Federal Agencies
export const FEDERAL_AGENCIES: GovernmentAgency[] = [
  {
    id: 'opmcm',
    name: 'Office of the Prime Minister and Council of Ministers',
    nameNe: 'प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय',
    acronym: 'OPMCM',
    category: 'ministry',
    categoryLabel: CATEGORY_LABELS.ministry,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Singha Durbar, Kathmandu',
    phone: '+977-1-4211000',
    email: 'info@opmcm.gov.np',
    website: 'https://opmcm.gov.np',
    services: ['Executive Governance', 'Inter-ministerial Coordination', 'National Policy Directives', 'Cabinet Decisions'],
    description: 'Supreme executive body of the Government of Nepal overseeing national administration and cabinet affairs.',
  },
  {
    id: 'mof',
    name: 'Ministry of Finance',
    nameNe: 'अर्थ मन्त्रालय',
    acronym: 'MoF',
    category: 'ministry',
    categoryLabel: CATEGORY_LABELS.ministry,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Singha Durbar, Kathmandu',
    phone: '+977-1-4211363',
    email: 'mof@mof.gov.np',
    website: 'https://mof.gov.np',
    services: ['National Budget', 'Fiscal Policy', 'Revenue Policy', 'Foreign Aid Coordination', 'Public Debt Management'],
    description: 'Responsible for fiscal management, revenue collection policy, budget drafting, and economic affairs.',
  },
  {
    id: 'moha',
    name: 'Ministry of Home Affairs',
    nameNe: 'गृह मन्त्रालय',
    acronym: 'MoHA',
    category: 'ministry',
    categoryLabel: CATEGORY_LABELS.ministry,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Singha Durbar, Kathmandu',
    phone: '+977-1-4211214',
    email: 'gunaso@moha.gov.np',
    website: 'https://moha.gov.np',
    services: ['Internal Security', 'Immigration & Citizenship', 'Disaster Relief Coordination', 'District Administration Oversight'],
    description: 'Governs internal security, civil administration through 77 DAOs, police organizations, and civil registration.',
  },
  {
    id: 'mofa',
    name: 'Ministry of Foreign Affairs',
    nameNe: 'परराष्ट्र मन्त्रालय',
    acronym: 'MoFA',
    category: 'ministry',
    categoryLabel: CATEGORY_LABELS.ministry,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Singha Durbar, Kathmandu',
    phone: '+977-1-4200182',
    email: 'info@mofa.gov.np',
    website: 'https://mofa.gov.np',
    services: ['Diplomatic Relations', 'Consular Services', 'Passport Department Oversight', 'Treaties & Bilateral Agreements'],
    description: 'Manages bilateral and multilateral diplomatic affairs and consular support for Nepali citizens abroad.',
  },
  {
    id: 'moph',
    name: 'Ministry of Health and Population',
    nameNe: 'स्वास्थ्य तथा जनसंख्या मन्त्रालय',
    acronym: 'MoHP',
    category: 'ministry',
    categoryLabel: CATEGORY_LABELS.ministry,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Ramshah Path, Kathmandu',
    phone: '+977-1-4262543',
    email: 'info@mohp.gov.np',
    website: 'https://mohp.gov.np',
    services: ['National Healthcare Policy', 'Disease Control', 'Pharmaceutical Regulation', 'Hospital Standards'],
    description: 'Directs the public healthcare delivery system, health insurance, and epidemiological surveillance in Nepal.',
  },
  {
    id: 'moest',
    name: 'Ministry of Education, Science and Technology',
    nameNe: 'शिक्षा, विज्ञान तथा प्रविधि मन्त्रालय',
    acronym: 'MoEST',
    category: 'ministry',
    categoryLabel: CATEGORY_LABELS.ministry,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Singha Durbar, Kathmandu',
    phone: '+977-1-4200374',
    email: 'info@moest.gov.np',
    website: 'https://moest.gov.np',
    services: ['National Curriculum', 'School Education Standards', 'No Objection Certificate (NOC)', 'Higher Education Oversight'],
    description: 'Formulates educational policy, oversees public universities, and issues foreign study NOCs.',
  },
  {
    id: 'mopit',
    name: 'Ministry of Physical Infrastructure and Transport',
    nameNe: 'भौतिक पूर्वाधार तथा यातायात मन्त्रालय',
    acronym: 'MoPIT',
    category: 'infrastructure',
    categoryLabel: CATEGORY_LABELS.infrastructure,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Singha Durbar, Kathmandu',
    phone: '+977-1-4211734',
    email: 'info@mopit.gov.np',
    website: 'https://mopit.gov.np',
    services: ['National Highways', 'Railway Development', 'Transport Licensing Regulations', 'Strategic Bridge Construction'],
    description: 'Oversees Department of Roads, Department of Transport Management, and major road network development.',
  },
  {
    id: 'moewri',
    name: 'Ministry of Energy, Water Resources and Irrigation',
    nameNe: 'ऊर्जा, जलस्रोत तथा सिँचाइ मन्त्रालय',
    acronym: 'MoEWRI',
    category: 'infrastructure',
    categoryLabel: CATEGORY_LABELS.infrastructure,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Singha Durbar, Kathmandu',
    phone: '+977-1-4211516',
    email: 'info@moewri.gov.np',
    website: 'https://moewri.gov.np',
    services: ['Hydropower Licensing', 'Transmission Grid Strategy', 'Irrigation Projects', 'River Training'],
    description: 'Regulates energy generation, national grid extension, irrigation canals, and water resources.',
  },
  {
    id: 'supreme-court',
    name: 'Supreme Court of Nepal',
    nameNe: 'सर्वोच्च अदालत',
    acronym: 'SC',
    category: 'judiciary',
    categoryLabel: CATEGORY_LABELS.judiciary,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Ramshah Path, Kathmandu',
    phone: '+977-1-4200700',
    email: 'info@supremecourt.gov.np',
    website: 'https://supremecourt.gov.np',
    services: ['Constitutional Bench', 'Appellate Jurisdiction', 'Judicial Review', 'Writs and Public Interest Litigation'],
    description: 'Highest court in the federal judiciary of Nepal and guardian of the Constitution.',
  },
  {
    id: 'election-commission',
    name: 'Election Commission of Nepal',
    nameNe: 'निर्वाचन आयोग',
    acronym: 'ECN',
    category: 'constitutional',
    categoryLabel: CATEGORY_LABELS.constitutional,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Kantipath, Kathmandu',
    phone: '+977-1-4228663',
    email: 'info@election.gov.np',
    website: 'https://election.gov.np',
    services: ['Voter Registration', 'Electoral Roll Management', 'Conduct of Elections', 'Political Party Registration'],
    description: 'Constitutional body conducting free and fair federal, provincial, and local level elections.',
  },
  {
    id: 'ciaa',
    name: 'Commission for the Investigation of Abuse of Authority',
    nameNe: 'अख्तियार दुरुपयोग अनुसन्धान आयोग',
    acronym: 'CIAA',
    category: 'constitutional',
    categoryLabel: CATEGORY_LABELS.constitutional,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Tangal, Kathmandu',
    phone: '+977-1-4440151',
    email: 'akhtiyar@ciaa.gov.np',
    website: 'https://ciaa.gov.np',
    services: ['Anti-Corruption Inquiries', 'Graft Prosecution', 'Toll-free Hotline (1071)', 'Public Asset Monitoring'],
    description: 'Apex constitutional anti-corruption ombudsman investigating improper conduct and corruption by public officials.',
  },
  {
    id: 'oag',
    name: 'Office of the Auditor General',
    nameNe: 'महालेखा परीक्षकको कार्यालय',
    acronym: 'OAG',
    category: 'constitutional',
    categoryLabel: CATEGORY_LABELS.constitutional,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Babarmahal, Kathmandu',
    phone: '+977-1-4262958',
    email: 'info@oagnep.gov.np',
    website: 'https://oag.gov.np',
    services: ['Government Financial Audits', 'Annual Audit Reports', 'Public Spending Accountability'],
    description: 'Constitutional auditor conducting external audits of all government offices and public corporations.',
  },
  {
    id: 'nrb',
    name: 'Nepal Rastra Bank',
    nameNe: 'नेपाल राष्ट्र बैंक',
    acronym: 'NRB',
    category: 'revenue',
    categoryLabel: CATEGORY_LABELS.revenue,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Baluwatar, Kathmandu',
    phone: '+977-1-4411250',
    email: 'nrb@nrb.org.np',
    website: 'https://nrb.org.np',
    services: ['Monetary Policy', 'Bank & Financial Institution Supervision', 'Foreign Exchange Regulations', 'Currency Issuance'],
    description: 'Central bank of the Federal Democratic Republic of Nepal controlling money supply and financial stability.',
  },
  {
    id: 'ird',
    name: 'Inland Revenue Department',
    nameNe: 'आन्तरिक राजस्व विभाग',
    acronym: 'IRD',
    category: 'revenue',
    categoryLabel: CATEGORY_LABELS.revenue,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Lazimpat, Kathmandu',
    phone: '+977-1-4415802',
    email: 'info@ird.gov.np',
    website: 'https://ird.gov.np',
    services: ['PAN Registration', 'VAT Filing', 'Income Tax Collection', 'Excise Duties', 'Tax Clearance Certificates'],
    description: 'Administers domestic tax revenues including Value Added Tax, Income Tax, and Excise duties.',
  },
  {
    id: 'doc',
    name: 'Department of Customs',
    nameNe: 'भन्सार विभाग',
    acronym: 'DoC',
    category: 'revenue',
    categoryLabel: CATEGORY_LABELS.revenue,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Tripureshwor, Kathmandu',
    phone: '+977-1-4259861',
    email: 'info@customs.gov.np',
    website: 'https://customs.gov.np',
    services: ['Customs Clearance (ASYCUDA)', 'Tariff Collection', 'Cross-border Trade Regulation', 'Anti-Smuggling Operations'],
    description: 'Oversees international border customs checkpoints, tariff assessments, and trade facilitation.',
  },
  {
    id: 'nepal-police-hq',
    name: 'Nepal Police Headquarters',
    nameNe: 'नेपाल प्रहरी प्रधान कार्यालय',
    acronym: 'NP',
    category: 'security',
    categoryLabel: CATEGORY_LABELS.security,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Naxal, Kathmandu',
    phone: '100',
    email: 'info@nepalpolice.gov.np',
    website: 'https://nepalpolice.gov.np',
    services: ['Police Emergency 100', 'Police Clearance Report (Online PCR)', 'Criminal Investigation (CID)', 'Traffic Control'],
    description: 'National civilian police service maintaining law, peace, order, and crime investigation across Nepal.',
  },
  {
    id: 'apf-hq',
    name: 'Armed Police Force Headquarters',
    nameNe: 'सशस्त्र प्रहरी बल, नेपाल प्रधान कार्यालय',
    acronym: 'APF',
    category: 'security',
    categoryLabel: CATEGORY_LABELS.security,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Halchowk, Swoyambhu, Kathmandu',
    phone: '1114',
    email: 'info@apf.gov.np',
    website: 'https://apf.gov.np',
    services: ['Border Security', 'Disaster Search & Rescue', 'VIP Security', 'Riot Control', 'Industrial Security'],
    description: 'Paramilitary police force safeguarding international borders, vital installations, and disaster response.',
  },
  {
    id: 'dhm',
    name: 'Department of Hydrology and Meteorology',
    nameNe: 'जल तथा मौसम विज्ञान विभाग',
    acronym: 'DHM',
    category: 'infrastructure',
    categoryLabel: CATEGORY_LABELS.infrastructure,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Babarmahal, Kathmandu',
    phone: '1155',
    email: 'dhm@dhm.gov.np',
    website: 'https://dhm.gov.np',
    services: ['Weather Forecast', 'River Flow & Flood Warnings (1155)', 'Aviation Meteorology', 'Climate Data Archive'],
    description: 'National agency monitoring weather, hydrological flows, and operating nationwide flood early warning systems.',
  },
  {
    id: 'ndrrma',
    name: 'National Disaster Risk Reduction and Management Authority',
    nameNe: 'राष्ट्रिय विपद् जोखिम न्यूनीकरण तथा व्यवस्थापन प्राधिकरण',
    acronym: 'NDRRMA',
    category: 'administration',
    categoryLabel: CATEGORY_LABELS.administration,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Singha Durbar, Kathmandu',
    phone: '+977-1-4200105',
    email: 'info@bipad.gov.np',
    website: 'https://bipadportal.gov.np',
    services: ['BIPAD Disaster Portal', 'Emergency Relief Coordination', 'Post-Disaster Reconstruction', 'Multi-hazard Alert System'],
    description: 'Coordinates national disaster management, mitigation, emergency logistics, and spatial risk data.',
  },
  {
    id: 'ppmo',
    name: 'Public Procurement Monitoring Office',
    nameNe: 'सार्वजनिक खरिद अनुगमन कार्यालय',
    acronym: 'PPMO',
    category: 'administration',
    categoryLabel: CATEGORY_LABELS.administration,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Tahachal, Kathmandu',
    phone: '+977-1-4279584',
    email: 'info@ppmo.gov.np',
    website: 'https://bolpatra.gov.np',
    services: ['e-GP Procurement Portal', 'Contractor Blacklisting', 'Procurement Audit Rules', 'Standard Bidding Documents'],
    description: 'Regulates and monitors public tenders, contracts, and electronic government procurement (e-GP) in Nepal.',
  },
  {
    id: 'nea-hq',
    name: 'Nepal Electricity Authority Headquarters',
    nameNe: 'नेपाल विद्युत प्राधिकरण केन्द्रीय कार्यालय',
    acronym: 'NEA',
    category: 'utility',
    categoryLabel: CATEGORY_LABELS.utility,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Durbarmarg, Kathmandu',
    phone: '+977-1-4153051',
    email: 'info@nea.org.np',
    website: 'https://nea.org.np',
    services: ['Electricity Supply Hotline (1150)', 'New Meter Connection', 'Power Transmission', 'Power Purchase Agreements'],
    description: 'State power corporation responsible for electricity generation, transmission, and nationwide customer distribution.',
  },
  {
    id: 'dop-passport',
    name: 'Department of Passports',
    nameNe: 'राहदानी विभाग',
    acronym: 'DoP',
    category: 'administration',
    categoryLabel: CATEGORY_LABELS.administration,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Tripureshwor, Kathmandu',
    phone: '+977-1-5970300',
    email: 'info@passportnepal.gov.np',
    website: 'https://passportnepal.gov.np',
    services: ['e-Passport Issuance', 'Passport Verification', 'Urgent Passport Booking', 'Travel Document Support'],
    description: 'Central agency issuing biometric electronic passports (e-Passport) to citizens of Nepal.',
  },
  {
    id: 'doi-immigration',
    name: 'Department of Immigration',
    nameNe: 'अध्यागमन विभाग',
    acronym: 'DoI',
    category: 'administration',
    categoryLabel: CATEGORY_LABELS.administration,
    level: 'federal',
    province: 'Bagmati',
    district: 'Kathmandu',
    palika: 'Kathmandu',
    address: 'Kalikasthan, Kathmandu',
    phone: '+977-1-4429659',
    email: 'info@immigration.gov.np',
    website: 'https://immigration.gov.np',
    services: ['Tourist Visa Extension', 'Trekking Permits for Restricted Areas', 'Arrival/Departure Regulation', 'Work Visas'],
    description: 'Regulates national entry and exit points, visa management, and restricted area trekking permits.',
  },
]

// 2. Province Capitals and Provincial Ministries mapping
export const PROVINCIAL_CAPITALS: Record<string, { capital: string; district: string; palika: string }> = {
  Koshi: { capital: 'Biratnagar', district: 'Morang', palika: 'Biratnagar' },
  Madhesh: { capital: 'Janakpur', district: 'Dhanusha', palika: 'Janakpur' },
  Bagmati: { capital: 'Hetauda', district: 'Makwanpur', palika: 'Hetauda' },
  Gandaki: { capital: 'Pokhara', district: 'Kaski', palika: 'Pokhara' },
  Lumbini: { capital: 'Deukhuri (Rapti)', district: 'Dang', palika: 'Rapti' },
  Karnali: { capital: 'Birendranagar', district: 'Surkhet', palika: 'Birendranagar' },
  Sudurpashchim: { capital: 'Godawari / Dhangadhi', district: 'Kailali', palika: 'Dhangadhi' },
}

export function generateProvincialAgencies(provinceName: string): GovernmentAgency[] {
  const cap = PROVINCIAL_CAPITALS[provinceName] ?? { capital: 'Provincial Capital', district: 'Central', palika: 'Capital' }
  const slug = provinceName.toLowerCase().replace(/[^a-z0-9]+/g, '-')

  return [
    {
      id: `${slug}-ocmcm`,
      name: `Office of the Chief Minister and Council of Ministers, ${provinceName} Province`,
      nameNe: `मुख्यमन्त्री तथा मन्त्रिपरिषद्को कार्यालय, ${provinceName} प्रदेश`,
      acronym: 'OCMCM',
      category: 'ministry',
      categoryLabel: CATEGORY_LABELS.ministry,
      level: 'provincial',
      province: provinceName,
      district: cap.district,
      palika: cap.palika,
      address: `${cap.capital}, ${provinceName} Province`,
      website: `https://ocmcm.${slug}.gov.np`,
      services: ['Provincial Cabinet Decisions', 'Provincial Policy Coordination', 'Inter-palika Coordination', 'Provincial Good Governance'],
      description: `Chief executive office of ${provinceName} Province coordinating provincial ministries and development policy.`,
    },
    {
      id: `${slug}-assembly`,
      name: `Provincial Assembly Secretariat, ${provinceName} Province`,
      nameNe: `प्रदेश सभा सचिवालय, ${provinceName} प्रदेश`,
      category: 'administration',
      categoryLabel: CATEGORY_LABELS.administration,
      level: 'provincial',
      province: provinceName,
      district: cap.district,
      palika: cap.palika,
      address: `${cap.capital}, ${provinceName} Province`,
      website: `https://pradeshsabha.${slug}.gov.np`,
      services: ['Provincial Legislation', 'Parliamentary Committees', 'Public Bill Deliberations'],
      description: `Legislative parliament secretariat for the elected assembly of ${provinceName} Province.`,
    },
    {
      id: `${slug}-moeap`,
      name: `Ministry of Economic Affairs and Planning, ${provinceName} Province`,
      nameNe: `आर्थिक मामिला तथा योजना मन्त्रालय, ${provinceName} प्रदेश`,
      category: 'ministry',
      categoryLabel: CATEGORY_LABELS.ministry,
      level: 'provincial',
      province: provinceName,
      district: cap.district,
      palika: cap.palika,
      address: `${cap.capital}, ${provinceName} Province`,
      services: ['Provincial Annual Budget', 'Fiscal Equalization Grants', 'Revenue Mobilization', 'Provincial Planning'],
      description: `Formulates the annual fiscal budget, expenditure plans, and fiscal policies for ${provinceName} Province.`,
    },
    {
      id: `${slug}-moial`,
      name: `Ministry of Internal Affairs and Law, ${provinceName} Province`,
      nameNe: `आन्तरिक मामिला तथा कानून मन्त्रालय, ${provinceName} प्रदेश`,
      category: 'ministry',
      categoryLabel: CATEGORY_LABELS.ministry,
      level: 'provincial',
      province: provinceName,
      district: cap.district,
      palika: cap.palika,
      address: `${cap.capital}, ${provinceName} Province`,
      services: ['Provincial Law Drafting', 'Provincial Security Policy', 'Disaster Response Command', 'Media Regulations'],
      description: `Administers security cooperation, disaster management, provincial legal framework, and communication affairs.`,
    },
    {
      id: `${slug}-mopid`,
      name: `Ministry of Physical Infrastructure Development, ${provinceName} Province`,
      nameNe: `भौतिक पूर्वाधार विकास मन्त्रालय, ${provinceName} प्रदेश`,
      category: 'infrastructure',
      categoryLabel: CATEGORY_LABELS.infrastructure,
      level: 'provincial',
      province: provinceName,
      district: cap.district,
      palika: cap.palika,
      address: `${cap.capital}, ${provinceName} Province`,
      services: ['Provincial Highways & Bridges', 'Water Supply & Sanitation Projects', 'Urban Planning', 'Irrigation Infrastructure'],
      description: `Builds and maintains provincial highways, rural access roads, bridges, and drinking water facilities.`,
    },
    {
      id: `${slug}-high-court`,
      name: `High Court, ${provinceName} Province (${cap.capital})`,
      nameNe: `उच्च अदालत, ${cap.capital}`,
      category: 'judiciary',
      categoryLabel: CATEGORY_LABELS.judiciary,
      level: 'provincial',
      province: provinceName,
      district: cap.district,
      palika: cap.palika,
      address: `${cap.capital}, ${provinceName} Province`,
      services: ['Appellate Jurisdiction over District Courts', 'Habeas Corpus & Writs', 'Commercial Appeals'],
      description: `Apex provincial court hearing appeals from all district courts and quasi-judicial tribunals in ${provinceName}.`,
    },
    {
      id: `${slug}-ppo`,
      name: `Province Police Office, ${provinceName} Province`,
      nameNe: `प्रदेश प्रहरी कार्यालय, ${provinceName} प्रदेश`,
      category: 'security',
      categoryLabel: CATEGORY_LABELS.security,
      level: 'provincial',
      province: provinceName,
      district: cap.district,
      palika: cap.palika,
      address: `${cap.capital}, ${provinceName} Province`,
      phone: '100',
      services: ['Provincial Crime Prevention', 'Highway Patrol & Safety', 'Special Task Force Deployments'],
      description: `Command headquarters for all district police offices and units deployed within ${provinceName} Province.`,
    },
    {
      id: `${slug}-ppsc`,
      name: `Province Public Service Commission, ${provinceName} Province`,
      nameNe: `प्रदेश लोक सेवा आयोग, ${provinceName} प्रदेश`,
      category: 'constitutional',
      categoryLabel: CATEGORY_LABELS.constitutional,
      level: 'provincial',
      province: provinceName,
      district: cap.district,
      palika: cap.palika,
      address: `${cap.capital}, ${provinceName} Province`,
      website: `https://ppsc.${slug}.gov.np`,
      services: ['Civil Service Examinations', 'Provincial Employee Recruitment', 'Local Level Staff Merit Testing'],
      description: `Conducts competitive merit recruitment examinations for civil service posts in provincial and local governments.`,
    },
  ]
}

// 3. District Statutory Agencies (Generated for any of the 77 Districts)
export function generateDistrictAgencies(district: DistrictDef): GovernmentAgency[] {
  const dName = district.name
  const slug = district.slug
  const pName = district.province

  return [
    {
      id: `${slug}-dao`,
      name: `District Administration Office (DAO), ${dName}`,
      nameNe: `जिल्ला प्रशासन कार्यालय, ${dName}`,
      acronym: 'DAO',
      category: 'administration',
      categoryLabel: CATEGORY_LABELS.administration,
      level: 'district',
      province: pName,
      district: dName,
      address: `District Headquarters, ${dName}`,
      website: `https://daonpal.gov.np`,
      services: [
        'Citizenship Certificate (नागरिकता प्रमाणपत्र)',
        'Passport Recommendation & Biometric Capture',
        'District Law & Order Oversight',
        'Organization / NGO Registration',
        'Arms & Ammunition Licensing',
        'District Disaster Management Committee (DDMC)',
      ],
      description: `Chief district executive office headed by the Chief District Officer (CDO), responsible for public security, civil registration, and governance.`,
    },
    {
      id: `${slug}-dpo`,
      name: `District Police Office (DPO), ${dName}`,
      nameNe: `जिल्ला प्रहरी कार्यालय, ${dName}`,
      acronym: 'DPO',
      category: 'security',
      categoryLabel: CATEGORY_LABELS.security,
      level: 'district',
      province: pName,
      district: dName,
      address: `Police Lines, ${dName}`,
      phone: '100',
      services: [
        'Emergency Police Response (100)',
        'FIR Registration & Criminal Investigation',
        'Police Clearance Report Verification',
        'Community Security & Women/Children Cell',
      ],
      description: `District law enforcement headquarters coordinating police posts, community safety, and investigation across ${dName}.`,
    },
    {
      id: `${slug}-court`,
      name: `District Court, ${dName}`,
      nameNe: `जिल्ला अदालत, ${dName}`,
      category: 'judiciary',
      categoryLabel: CATEGORY_LABELS.judiciary,
      level: 'district',
      province: pName,
      district: dName,
      address: `Court Complex, ${dName}`,
      services: [
        'Civil Suits & Land Disputes',
        'Criminal Trials & Bail Hearings',
        'Marriage Registration by Court (Court Marriage)',
        'Execution of Decrees & Injunctions',
      ],
      description: `Principal trial court of civil and criminal original jurisdiction for all citizens in ${dName} District.`,
    },
    {
      id: `${slug}-malpot`,
      name: `Land Revenue Office (Malpot), ${dName}`,
      nameNe: `मालपोत कार्यालय, ${dName}`,
      category: 'revenue',
      categoryLabel: CATEGORY_LABELS.revenue,
      level: 'district',
      province: pName,
      district: dName,
      address: `Revenue Complex, ${dName}`,
      services: [
        'Land Ownership Certificate (Lalpurja)',
        'Land Title Deed Registration & Transfer (राजीनामा / नामसारी)',
        'Property Mortgage & Bank Release (रोक्का / फुकुवा)',
        'Digital Land Records (DLIS)',
      ],
      description: `Statutory agency responsible for land ownership registration, deed recording, property transaction tax, and land records.`,
    },
    {
      id: `${slug}-napi`,
      name: `Survey Office (Napi), ${dName}`,
      nameNe: `नापी कार्यालय, ${dName}`,
      category: 'infrastructure',
      categoryLabel: CATEGORY_LABELS.infrastructure,
      level: 'district',
      province: pName,
      district: dName,
      address: `Survey Office Building, ${dName}`,
      services: [
        'Cadastral Map Blueprint Issuance (नक्सा प्रिन्ट)',
        'Land Boundary Verification & Demarcation (कित्ताकाट / सिमाना जाँच)',
        'Field Plot Measurement',
      ],
      description: `Technical cadastral mapping agency managing spatial land parcel demarcations and parcel subdivision (Kittakat).`,
    },
    {
      id: `${slug}-dtco`,
      name: `District Treasury and Accounts Controller Office (DTCO), ${dName}`,
      nameNe: `कोष तथा लेखा नियन्त्रक कार्यालय (कोलेनिका), ${dName}`,
      acronym: 'DTCO',
      category: 'revenue',
      categoryLabel: CATEGORY_LABELS.revenue,
      level: 'district',
      province: pName,
      district: dName,
      address: `Government Accounts Building, ${dName}`,
      services: [
        'Single Treasury Account (TSA) Management',
        'Government Employee & Teacher Pension Disbursement',
        'District Revenue Accounting',
        'Public Expenditure Audit & Authorization',
      ],
      description: `Oversees all federal and provincial budget allocations, internal expenditure controls, and payroll disbursements in ${dName}.`,
    },
    {
      id: `${slug}-health`,
      name: `District Health Office / District Hospital, ${dName}`,
      nameNe: `जिल्ला स्वास्थ्य कार्यालय / जिल्ला अस्पताल, ${dName}`,
      category: 'health',
      categoryLabel: CATEGORY_LABELS.health,
      level: 'district',
      province: pName,
      district: dName,
      address: `Hospital Road, ${dName}`,
      phone: '102',
      services: [
        '24/7 Emergency & Maternity Services',
        'National Immunization Program Coordination',
        'Epidemic & Communicable Disease Control',
        'Health Insurance Scheme Support',
      ],
      description: `Coordinates district-wide public health programs, vaccination, maternal child care, and secondary medical care.`,
    },
    {
      id: `${slug}-dcc`,
      name: `District Coordination Committee (DCC), ${dName}`,
      nameNe: `जिल्ला समन्वय समिति (जिसस), ${dName}`,
      acronym: 'DCC',
      category: 'administration',
      categoryLabel: CATEGORY_LABELS.administration,
      level: 'district',
      province: pName,
      district: dName,
      address: `DCC Secretariat, ${dName}`,
      services: [
        'Inter-palika Development Coordination',
        'Monitoring of Public Infrastructure Projects',
        'District Resource Dispute Mediation',
      ],
      description: `Elected constitutional body coordinating development work and cooperation among all municipalities in ${dName}.`,
    },
    {
      id: `${slug}-forest`,
      name: `Division Forest Office, ${dName}`,
      nameNe: `डिभिजन वन कार्यालय, ${dName}`,
      category: 'infrastructure',
      categoryLabel: CATEGORY_LABELS.infrastructure,
      level: 'district',
      province: pName,
      district: dName,
      address: `Forest Division, ${dName}`,
      services: [
        'Forest Conservation & Tree Felling Permits',
        'Community Forest User Group (CFUG) Registration',
        'Wildlife Conflict Mitigation',
      ],
      description: `Manages state forests, biodiversity protection, community forest handovers, and wildlife conservation.`,
    },
    {
      id: `${slug}-post`,
      name: `District Post Office, ${dName}`,
      nameNe: `जिल्ला हुलाक कार्यालय, ${dName}`,
      category: 'utility',
      categoryLabel: CATEGORY_LABELS.utility,
      level: 'district',
      province: pName,
      district: dName,
      address: `Post Office Road, ${dName}`,
      services: [
        'Postal Dispatch & EMS Express Parcel',
        'Postal Saving Bank Services',
        'Government Gazette & Document Delivery',
      ],
      description: `Operates domestic and international mail delivery, parcel logistics, and postal money orders in ${dName}.`,
    },
  ]
}

// 4. Palika / Municipality Agencies (Generated for any of the 753 Local Units)
export function generatePalikaAgencies(palika: LocalUnitDef): GovernmentAgency[] {
  const pName = palika.name
  const dName = palika.district
  const provName = palika.province
  const slug = `${palika.district.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${palika.slug}`

  const kindLabel =
    palika.kind === 'metropolitan'
      ? 'Metropolitan City'
      : palika.kind === 'sub_metropolitan'
        ? 'Sub-Metropolitan City'
        : palika.kind === 'municipality'
          ? 'Municipality'
          : 'Rural Municipality'

  const kindNe =
    palika.kind === 'metropolitan'
      ? 'महानगरपालिका'
      : palika.kind === 'sub_metropolitan'
        ? 'उपमहानगरपालिका'
        : palika.kind === 'municipality'
          ? 'नगरपालिका'
          : 'गाउँपालिका'

  return [
    {
      id: `${slug}-executive`,
      name: `Office of the Municipal Executive, ${pName} ${kindLabel}`,
      nameNe: `${pName} ${kindNe} कार्यपालिकाको कार्यालय`,
      category: 'local_government',
      categoryLabel: CATEGORY_LABELS.local_government,
      level: 'palika',
      province: provName,
      district: dName,
      palika: pName,
      address: `Municipal Executive Office, ${pName}, ${dName}`,
      services: [
        'Municipal Budget & Local Bylaws',
        'Building Construction Permits & नक्सा पास',
        'Local Business & Trade Registration (व्यवसाय दर्ता)',
        'Local Property & House Rent Tax Assessment',
        'Agriculture & Livestock Subsidy Programs',
      ],
      description: `Local self-government headquarters executing municipal development, urban planning, citizen services, and municipal council decisions.`,
    },
    {
      id: `${slug}-judicial`,
      name: `Municipal Judicial Committee, ${pName} ${kindLabel}`,
      nameNe: `न्यायिक समिति, ${pName} ${kindNe}`,
      category: 'judiciary',
      categoryLabel: CATEGORY_LABELS.judiciary,
      level: 'palika',
      province: provName,
      district: dName,
      palika: pName,
      address: `Municipal Executive Complex, ${pName}`,
      services: [
        'Local Dispute Mediation (विवाद मेलमिलाप)',
        'Land & Border Wall Conflicts (सिमाना विवाद)',
        'Elderly Maintenance & Family Dispute Resolution',
        'House Rent & Wage Grievances',
      ],
      description: `Quasi-judicial constitutional bench headed by Deputy Mayor / Vice-Chairperson resolving community disputes and civil grievances.`,
    },
    {
      id: `${slug}-ward`,
      name: `Ward Offices (वडा कार्यालयहरू), ${pName} ${kindLabel}`,
      nameNe: `वडा कार्यालयहरू, ${pName} ${kindNe}`,
      category: 'local_government',
      categoryLabel: CATEGORY_LABELS.local_government,
      level: 'palika',
      province: provName,
      district: dName,
      palika: pName,
      address: `All Wards across ${pName}`,
      services: [
        'Vital Registration (Birth, Death, Marriage, Divorce Certificates)',
        'Citizenship Recommendation (नागरिकता सिफारिस)',
        'Relationship Verification (नाता प्रमाणित)',
        'Four Boundary & Property Valuation Recommendation (चार किल्ला प्रमाणित)',
      ],
      description: `Grassroots local governance centers providing frontline civil registration, verification, and community certificates to residents.`,
    },
    {
      id: `${slug}-health-centre`,
      name: `Primary Health Centre / Municipal Hospital, ${pName}`,
      nameNe: `प्राथमिक स्वास्थ्य केन्द्र / नगर अस्पताल, ${pName}`,
      category: 'health',
      categoryLabel: CATEGORY_LABELS.health,
      level: 'palika',
      province: provName,
      district: dName,
      palika: pName,
      address: `${pName}, ${dName}`,
      phone: '102',
      services: [
        'Outpatient (OPD) & Basic Emergency Care',
        'Safe Motherhood & Institutional Birthing',
        'Free Essential Medicines Distribution',
        'Child Growth & Routine Immunization',
      ],
      description: `Community primary healthcare facility delivering free essential health services, maternal care, and immunizations.`,
    },
    {
      id: `${slug}-area-police`,
      name: `Area Police Office / Police Beat, ${pName}`,
      nameNe: `इलाका प्रहरी कार्यालय / प्रहरी चौकी, ${pName}`,
      category: 'security',
      categoryLabel: CATEGORY_LABELS.security,
      level: 'palika',
      province: provName,
      district: dName,
      palika: pName,
      address: `${pName}, ${dName}`,
      phone: '100',
      services: [
        'Community Patrol & Local Peace Maintenance',
        'Public Complaint Reception & First Response',
        'Highway Safety & Traffic Assistance',
      ],
      description: `Local police substation maintaining peace, security, crime deterrence, and citizen safety in the municipality.`,
    },
  ]
}

// 5. Query and Search Helpers
export type AgencyFilterOptions = {
  scope?: 'all' | 'federal' | 'provincial' | 'district' | 'palika'
  level?: AgencyLevel
  province?: string
  district?: string
  palika?: string
  category?: AgencyCategory
  query?: string
  limit?: number
  offset?: number
}

function normalize(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097f]+/g, ' ')
    .trim()
}

export function getAgenciesByPlace(
  scope: 'province' | 'district' | 'palika' | 'federal',
  placeName: string,
  districtName?: string
): GovernmentAgency[] {
  const normalized = normalize(placeName)

  if (scope === 'federal') {
    return FEDERAL_AGENCIES
  }

  if (scope === 'province') {
    const prov = PROVINCES.find(p => normalize(p.name) === normalized || normalize(p.slug) === normalized)
    if (!prov) return []

    const provAgencies = generateProvincialAgencies(prov.name)
    // Also include federal ministries located within this province (e.g., Bagmati hosts federal ministries)
    const fedInProv = FEDERAL_AGENCIES.filter(a => a.province === prov.name)
    // Also list district admin of capital
    const cap = PROVINCIAL_CAPITALS[prov.name]
    const capDistrict = cap ? DISTRICTS.find(d => d.name === cap.district) : undefined
    const distAgencies = capDistrict ? generateDistrictAgencies(capDistrict).slice(0, 4) : []

    return [...provAgencies, ...fedInProv, ...distAgencies]
  }

  if (scope === 'district') {
    const dist = DISTRICTS.find(d => normalize(d.name) === normalized || normalize(d.slug) === normalized)
    if (!dist) return []

    const statutory = generateDistrictAgencies(dist)
    // Also check if any provincial capital or federal agency is in this district
    const fedInDist = FEDERAL_AGENCIES.filter(a => a.district === dist.name)
    const provCap = PROVINCIAL_CAPITALS[dist.province]
    const provInDist = provCap && provCap.district === dist.name ? generateProvincialAgencies(dist.province) : []

    return [...statutory, ...provInDist, ...fedInDist]
  }

  if (scope === 'palika') {
    let unit: LocalUnitDef | undefined
    if (districtName) {
      const dNorm = normalize(districtName)
      unit = LOCAL_UNITS.find(
        u =>
          (normalize(u.district) === dNorm || normalize(u.district.replace(/\s+/g, '-')) === dNorm) &&
          (normalize(u.name) === normalized || normalize(u.slug) === normalized)
      )
    }
    if (!unit) {
      unit = LOCAL_UNITS.find(u => normalize(u.name) === normalized || normalize(u.slug) === normalized)
    }
    if (!unit) return []

    const palikaAgencies = generatePalikaAgencies(unit)
    // Also attach district-level statutory offices serving this municipality
    const parentDistrict = DISTRICTS.find(d => d.name === unit?.district)
    const districtOffices = parentDistrict ? generateDistrictAgencies(parentDistrict).slice(0, 3) : []

    return [...palikaAgencies, ...districtOffices]
  }

  return []
}

export function searchGovernmentAgencies(query: string, limit = 50): GovernmentAgency[] {
  const q = normalize(query)
  if (!q) {
    return [
      ...FEDERAL_AGENCIES.slice(0, 15),
      ...generateProvincialAgencies('Bagmati').slice(0, 4),
      ...generateDistrictAgencies(DISTRICTS[4]).slice(0, 5), // Kathmandu
    ]
  }

  const terms = q.split(' ').filter(Boolean)
  const results: { agency: GovernmentAgency; score: number }[] = []

  function check(agency: GovernmentAgency) {
    const text = normalize(
      `${agency.name} ${agency.nameNe} ${agency.acronym ?? ''} ${agency.category} ${agency.categoryLabel} ${agency.province ?? ''} ${agency.district ?? ''} ${agency.palika ?? ''} ${agency.address} ${agency.services.join(' ')} ${agency.description}`
    )

    let score = 0
    if (agency.acronym && normalize(agency.acronym) === q) score += 150
    if (normalize(agency.name) === q) score += 120
    if (normalize(agency.nameNe) === q) score += 120
    if (normalize(agency.name).startsWith(q)) score += 90
    if (text.includes(q)) score += 60

    let termMatches = 0
    for (const term of terms) {
      if (text.includes(term)) termMatches++
    }
    score += termMatches * 20

    if (score > 0) {
      results.push({ agency, score })
    }
  }

  // 1. Check Federal
  for (const ag of FEDERAL_AGENCIES) check(ag)

  // 2. Check Provincial
  for (const prov of PROVINCES) {
    for (const ag of generateProvincialAgencies(prov.name)) check(ag)
  }

  // 3. Check District-level matches
  // If query mentions a district name or district keyword, evaluate matching districts
  for (const dist of DISTRICTS) {
    const distNorm = normalize(dist.name)
    if (q.includes(distNorm) || terms.some(t => distNorm.includes(t)) || q.includes('dao') || q.includes('dpo') || q.includes('district') || q.includes('cdo') || q.includes('court') || q.includes('malpot') || q.includes('napi') || q.includes('hospital')) {
      for (const ag of generateDistrictAgencies(dist)) check(ag)
    }
  }

  // 4. Check Palika matches
  for (const unit of LOCAL_UNITS) {
    const unitNorm = normalize(unit.name)
    if (q.includes(unitNorm) || terms.some(t => t.length > 3 && unitNorm.includes(t))) {
      for (const ag of generatePalikaAgencies(unit)) check(ag)
    }
  }

  // Sort by score
  results.sort((a, b) => b.score - a.score || a.agency.name.localeCompare(b.agency.name))

  // Deduplicate by ID
  const seen = new Set<string>()
  const deduped: GovernmentAgency[] = []
  for (const r of results) {
    if (!seen.has(r.agency.id)) {
      seen.add(r.agency.id)
      deduped.push(r.agency)
      if (deduped.length >= limit) break
    }
  }

  return deduped
}

export function getAllCompiledAgencies(options?: AgencyFilterOptions): {
  agencies: GovernmentAgency[]
  total: number
} {
  const {
    scope,
    level,
    province,
    district,
    palika,
    category,
    query,
    limit = 60,
    offset = 0,
  } = options ?? {}

  let pool: GovernmentAgency[] = []

  // Build target pool
  if (!scope || scope === 'all' || scope === 'federal' || level === 'federal') {
    pool.push(...FEDERAL_AGENCIES)
  }

  if (!scope || scope === 'all' || scope === 'provincial' || level === 'provincial') {
    const targetProvinces = province ? PROVINCES.filter(p => p.name === province) : PROVINCES
    for (const p of targetProvinces) {
      pool.push(...generateProvincialAgencies(p.name))
    }
  }

  if (!scope || scope === 'all' || scope === 'district' || level === 'district') {
    const targetDistricts = district
      ? DISTRICTS.filter(d => d.name === district)
      : province
        ? DISTRICTS.filter(d => d.province === province)
        : DISTRICTS
    for (const d of targetDistricts) {
      pool.push(...generateDistrictAgencies(d))
    }
  }

  if (!scope || scope === 'all' || scope === 'palika' || level === 'palika') {
    const targetUnits = palika
      ? LOCAL_UNITS.filter(u => u.name === palika && (!district || u.district === district))
      : district
        ? LOCAL_UNITS.filter(u => u.district === district)
        : province
          ? LOCAL_UNITS.filter(u => u.province === province)
          : LOCAL_UNITS.slice(0, 100) // sample if wide
    for (const u of targetUnits) {
      pool.push(...generatePalikaAgencies(u))
    }
  }

  // Filters
  if (level) {
    pool = pool.filter(a => a.level === level)
  }
  if (province) {
    pool = pool.filter(a => a.province === province)
  }
  if (district) {
    pool = pool.filter(a => a.district === district)
  }
  if (palika) {
    pool = pool.filter(a => a.palika === palika)
  }
  if (category) {
    pool = pool.filter(a => a.category === category)
  }

  if (query && query.trim()) {
    const q = normalize(query)
    const terms = q.split(' ').filter(Boolean)
    pool = pool.filter(agency => {
      const text = normalize(
        `${agency.name} ${agency.nameNe} ${agency.acronym ?? ''} ${agency.category} ${agency.categoryLabel} ${agency.province ?? ''} ${agency.district ?? ''} ${agency.palika ?? ''} ${agency.address} ${agency.services.join(' ')} ${agency.description}`
      )
      return terms.every(term => text.includes(term))
    })
  }

  const total = pool.length
  const paged = pool.slice(offset, offset + limit)

  return { agencies: paged, total }
}

export function getAgencyStats() {
  return {
    totalFederal: FEDERAL_AGENCIES.length,
    totalProvinces: PROVINCES.length,
    totalDistricts: DISTRICTS.length,
    totalPalikas: LOCAL_UNITS.length,
    estimatedTotalAgencies:
      FEDERAL_AGENCIES.length +
      PROVINCES.length * 8 +
      DISTRICTS.length * 10 +
      LOCAL_UNITS.length * 5, // ~4,600+ statutory local public offices nationwide
  }
}
