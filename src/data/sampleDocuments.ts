import { UploadedDoc, WorkbookConfig, ExtractedWorkbookData } from '../types';

export const SAMPLE_DOCS: {
  doc: UploadedDoc;
  defaultConfig: WorkbookConfig;
  mockExtractedData: ExtractedWorkbookData;
  svgPreview: string;
}[] = [
  {
    doc: {
      id: 'sample-customer-report-pdf',
      name: 'Q3_Customer_Accounts_and_Sales_Report.pdf',
      size: 1420580,
      type: 'application/pdf',
      lastModified: Date.now() - 3600000 * 24,
      previewUrl: '',
      pageCount: 3,
      isSample: true,
    },
    defaultConfig: {
      filename: 'customer_report.xlsx',
      sheets: [
        {
          id: 'sheet-customers',
          name: 'Customers',
          columns: ['Customer Name', 'Customer ID', 'Phone', 'Email', 'Region'],
          description: 'Master record of business accounts and contact details',
        },
        {
          id: 'sheet-transactions',
          name: 'Transactions',
          columns: ['Transaction ID', 'Customer ID', 'Date', 'Amount', 'Payment Method', 'Status'],
          description: 'Financial transactions, invoices and settlement statuses',
        },
      ],
      instructions:
        'Create two sheets. Put customer information in Customers and transaction information in Transactions. Use the first row for column headers.',
    },
    svgPreview: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="850" viewBox="0 0 600 850" fill="none">
      <rect width="600" height="850" fill="#FFFFFF"/>
      <rect x="35" y="35" width="530" height="780" rx="4" stroke="#E2E8F0" stroke-width="1.5" fill="#FAFAFA"/>
      <!-- Header banner -->
      <rect x="50" y="50" width="500" height="70" rx="6" fill="#0F172A"/>
      <text x="75" y="85" fill="#F8FAFC" font-family="sans-serif" font-size="18" font-weight="bold">GLOBAL ENTERPRISE LOGISTICS CORP</text>
      <text x="75" y="105" fill="#94A3B8" font-family="sans-serif" font-size="12">Quarterly Customer Summary &amp; Settlement Statement • Q3-2026</text>
      
      <!-- Section 1: Customer Accounts -->
      <rect x="50" y="140" width="500" height="28" fill="#F1F5F9" rx="3"/>
      <text x="65" y="159" fill="#1E293B" font-family="sans-serif" font-size="12" font-weight="bold">TABLE 1: REGISTERED CLIENT DIRECTORY</text>
      
      <!-- Table Headers -->
      <text x="60" y="188" fill="#475569" font-family="sans-serif" font-size="10" font-weight="600">CUSTOMER NAME</text>
      <text x="210" y="188" fill="#475569" font-family="sans-serif" font-size="10" font-weight="600">CUSTOMER ID</text>
      <text x="310" y="188" fill="#475569" font-family="sans-serif" font-size="10" font-weight="600">PHONE</text>
      <text x="410" y="188" fill="#475569" font-family="sans-serif" font-size="10" font-weight="600">EMAIL</text>
      <line x1="50" y1="195" x2="550" y2="195" stroke="#CBD5E1" stroke-width="1"/>

      <!-- Row 1 -->
      <text x="60" y="215" fill="#0F172A" font-family="sans-serif" font-size="11">Apex Vanguard Solutions</text>
      <text x="210" y="215" fill="#0F172A" font-family="sans-serif" font-size="11">CUST-84920</text>
      <text x="310" y="215" fill="#0F172A" font-family="sans-serif" font-size="11">+1 (415) 892-0193</text>
      <text x="410" y="215" fill="#0F172A" font-family="sans-serif" font-size="11">ops@apexvanguard.io</text>

      <!-- Row 2 -->
      <text x="60" y="240" fill="#0F172A" font-family="sans-serif" font-size="11">Beacon Hill Therapeutics</text>
      <text x="210" y="240" fill="#0F172A" font-family="sans-serif" font-size="11">CUST-61029</text>
      <text x="310" y="240" fill="#0F172A" font-family="sans-serif" font-size="11">+1 (617) 442-8810</text>
      <text x="410" y="240" fill="#0F172A" font-family="sans-serif" font-size="11">billing@beaconhillrx.com</text>

      <!-- Row 3 (Slight smudge) -->
      <text x="60" y="265" fill="#0F172A" font-family="sans-serif" font-size="11">Crestline Bioengineering</text>
      <text x="210" y="265" fill="#0F172A" font-family="sans-serif" font-size="11">CUST-39182</text>
      <text x="310" y="265" fill="#0F172A" font-family="sans-serif" font-size="11">+1 (206) 918-2041</text>
      <text x="410" y="265" fill="#0F172A" font-family="sans-serif" font-size="11">contact@crestlinebio.org</text>

      <!-- Row 4 -->
      <text x="60" y="290" fill="#0F172A" font-family="sans-serif" font-size="11">Delta Meridian Tech</text>
      <text x="210" y="290" fill="#0F172A" font-family="sans-serif" font-size="11">CUST-77401</text>
      <text x="310" y="290" fill="#0F172A" font-family="sans-serif" font-size="11">+1 (312) 551-7890</text>
      <text x="410" y="290" fill="#0F172A" font-family="sans-serif" font-size="11">finance@deltameridian.com</text>

      <!-- Row 5 -->
      <text x="60" y="315" fill="#0F172A" font-family="sans-serif" font-size="11">Echo Ridge Aerospace</text>
      <text x="210" y="315" fill="#0F172A" font-family="sans-serif" font-size="11">CUST-90124</text>
      <text x="310" y="315" fill="#0F172A" font-family="sans-serif" font-size="11">+1 (512) 670-3341</text>
      <text x="410" y="315" fill="#0F172A" font-family="sans-serif" font-size="11">procure@echoridge.space</text>

      <!-- Section 2: Transactions -->
      <rect x="50" y="360" width="500" height="28" fill="#F1F5F9" rx="3"/>
      <text x="65" y="379" fill="#1E293B" font-family="sans-serif" font-size="12" font-weight="bold">TABLE 2: SETTLED INVOICES &amp; TRANSACTIONS</text>

      <!-- Table 2 Headers -->
      <text x="60" y="408" fill="#475569" font-family="sans-serif" font-size="10" font-weight="600">TX ID</text>
      <text x="140" y="408" fill="#475569" font-family="sans-serif" font-size="10" font-weight="600">CUSTOMER ID</text>
      <text x="240" y="408" fill="#475569" font-family="sans-serif" font-size="10" font-weight="600">DATE</text>
      <text x="330" y="408" fill="#475569" font-family="sans-serif" font-size="10" font-weight="600">AMOUNT</text>
      <text x="430" y="408" fill="#475569" font-family="sans-serif" font-size="10" font-weight="600">STATUS</text>
      <line x1="50" y1="415" x2="550" y2="415" stroke="#CBD5E1" stroke-width="1"/>

      <!-- Tx Row 1 -->
      <text x="60" y="435" fill="#0F172A" font-family="sans-serif" font-size="11">TX-9901</text>
      <text x="140" y="435" fill="#0F172A" font-family="sans-serif" font-size="11">CUST-84920</text>
      <text x="240" y="435" fill="#0F172A" font-family="sans-serif" font-size="11">2026-08-14</text>
      <text x="330" y="435" fill="#0F172A" font-family="sans-serif" font-size="11">$14,850.00</text>
      <text x="430" y="435" fill="#16A34A" font-family="sans-serif" font-size="11" font-weight="bold">COMPLETED</text>

      <!-- Tx Row 2 -->
      <text x="60" y="460" fill="#0F172A" font-family="sans-serif" font-size="11">TX-9902</text>
      <text x="140" y="460" fill="#0F172A" font-family="sans-serif" font-size="11">CUST-61029</text>
      <text x="240" y="460" fill="#0F172A" font-family="sans-serif" font-size="11">2026-08-19</text>
      <text x="330" y="460" fill="#0F172A" font-family="sans-serif" font-size="11">$8,210.50</text>
      <text x="430" y="460" fill="#16A34A" font-family="sans-serif" font-size="11" font-weight="bold">COMPLETED</text>

      <!-- Tx Row 3 (OCR smudged date & amount) -->
      <text x="60" y="485" fill="#0F172A" font-family="sans-serif" font-size="11">TX-9903</text>
      <text x="140" y="485" fill="#0F172A" font-family="sans-serif" font-size="11">CUST-39182</text>
      <text x="240" y="485" fill="#0F172A" font-family="sans-serif" font-size="11">2026-08-22</text>
      <text x="330" y="485" fill="#0F172A" font-family="sans-serif" font-size="11">$3,420.00</text>
      <text x="430" y="485" fill="#D97706" font-family="sans-serif" font-size="11" font-weight="bold">PENDING</text>

      <!-- Tx Row 4 -->
      <text x="60" y="510" fill="#0F172A" font-family="sans-serif" font-size="11">TX-9904</text>
      <text x="140" y="510" fill="#0F172A" font-family="sans-serif" font-size="11">CUST-77401</text>
      <text x="240" y="510" fill="#0F172A" font-family="sans-serif" font-size="11">2026-09-02</text>
      <text x="330" y="510" fill="#0F172A" font-family="sans-serif" font-size="11">$27,600.00</text>
      <text x="430" y="510" fill="#16A34A" font-family="sans-serif" font-size="11" font-weight="bold">COMPLETED</text>

      <!-- Tx Row 5 -->
      <text x="60" y="535" fill="#0F172A" font-family="sans-serif" font-size="11">TX-9905</text>
      <text x="140" y="535" fill="#0F172A" font-family="sans-serif" font-size="11">CUST-90124</text>
      <text x="240" y="535" fill="#0F172A" font-family="sans-serif" font-size="11">2026-09-05</text>
      <text x="330" y="535" fill="#0F172A" font-family="sans-serif" font-size="11">$11,400.00</text>
      <text x="430" y="535" fill="#16A34A" font-family="sans-serif" font-size="11" font-weight="bold">COMPLETED</text>

      <!-- Official stamp watermark -->
      <circle cx="480" cy="680" r="55" stroke="#94A3B8" stroke-width="2" stroke-dasharray="4,4" fill="none"/>
      <text x="480" y="675" fill="#64748B" font-family="sans-serif" font-size="10" text-anchor="middle" font-weight="bold">FINANCE AUDIT</text>
      <text x="480" y="692" fill="#64748B" font-family="sans-serif" font-size="9" text-anchor="middle">VERIFIED Q3</text>

      <!-- Footer -->
      <line x1="50" y1="760" x2="550" y2="760" stroke="#E2E8F0" stroke-width="1"/>
      <text x="50" y="780" fill="#94A3B8" font-family="sans-serif" font-size="10">Page 1 of 3 • System Generated Audit Document • ISO 9001 Compliant</text>
    </svg>`,
    mockExtractedData: {
      workbookFilename: 'customer_report.xlsx',
      overallConfidence: 0.94,
      extractedAt: new Date().toISOString(),
      warningsCount: 2,
      sheets: [
        {
          sheetId: 'sheet-customers',
          sheetName: 'Customers',
          columns: ['Customer Name', 'Customer ID', 'Phone', 'Email', 'Region'],
          rows: [
            {
              'Customer Name': { value: 'Apex Vanguard Solutions', confidence: 0.99 },
              'Customer ID': { value: 'CUST-84920', confidence: 0.98 },
              Phone: { value: '+1 (415) 892-0193', confidence: 0.97 },
              Email: { value: 'ops@apexvanguard.io', confidence: 0.98 },
              Region: { value: 'North America (West)', confidence: 0.95 },
            },
            {
              'Customer Name': { value: 'Beacon Hill Therapeutics', confidence: 0.99 },
              'Customer ID': { value: 'CUST-61029', confidence: 0.98 },
              Phone: { value: '+1 (617) 442-8810', confidence: 0.96 },
              Email: { value: 'billing@beaconhillrx.com', confidence: 0.97 },
              Region: { value: 'North America (East)', confidence: 0.96 },
            },
            {
              'Customer Name': { value: 'Crestline Bioengineering', confidence: 0.98 },
              'Customer ID': {
                value: 'CUST-39182',
                confidence: 0.88,
                flagged: true,
                warningNote: 'Character "1" had slight document smear; confirmed from checksum.',
              },
              Phone: { value: '+1 (206) 918-2041', confidence: 0.96 },
              Email: { value: 'contact@crestlinebio.org', confidence: 0.98 },
              Region: { value: 'Pacific Northwest', confidence: 0.92 },
            },
            {
              'Customer Name': { value: 'Delta Meridian Tech', confidence: 0.99 },
              'Customer ID': { value: 'CUST-77401', confidence: 0.99 },
              Phone: { value: '+1 (312) 551-7890', confidence: 0.98 },
              Email: { value: 'finance@deltameridian.com', confidence: 0.98 },
              Region: { value: 'Midwest', confidence: 0.97 },
            },
            {
              'Customer Name': { value: 'Echo Ridge Aerospace', confidence: 0.99 },
              'Customer ID': { value: 'CUST-90124', confidence: 0.99 },
              Phone: { value: '+1 (512) 670-3341', confidence: 0.97 },
              Email: { value: 'procure@echoridge.space', confidence: 0.98 },
              Region: { value: 'South Central', confidence: 0.96 },
            },
          ],
        },
        {
          sheetId: 'sheet-transactions',
          sheetName: 'Transactions',
          columns: ['Transaction ID', 'Customer ID', 'Date', 'Amount', 'Payment Method', 'Status'],
          rows: [
            {
              'Transaction ID': { value: 'TX-9901', confidence: 0.99 },
              'Customer ID': { value: 'CUST-84920', confidence: 0.98 },
              Date: { value: '2026-08-14', confidence: 0.99 },
              Amount: { value: 14850.0, confidence: 0.98 },
              'Payment Method': { value: 'ACH Wire Transfer', confidence: 0.96 },
              Status: { value: 'COMPLETED', confidence: 0.99 },
            },
            {
              'Transaction ID': { value: 'TX-9902', confidence: 0.99 },
              'Customer ID': { value: 'CUST-61029', confidence: 0.98 },
              Date: { value: '2026-08-19', confidence: 0.99 },
              Amount: { value: 8210.5, confidence: 0.98 },
              'Payment Method': { value: 'Corporate Card', confidence: 0.95 },
              Status: { value: 'COMPLETED', confidence: 0.99 },
            },
            {
              'Transaction ID': { value: 'TX-9903', confidence: 0.99 },
              'Customer ID': { value: 'CUST-39182', confidence: 0.97 },
              Date: { value: '2026-08-22', confidence: 0.98 },
              Amount: {
                value: 3420.0,
                confidence: 0.81,
                flagged: true,
                warningNote: 'Decimal point was faintly printed; detected as 3420.00. Please verify against preview.',
              },
              'Payment Method': { value: 'Purchase Order', confidence: 0.94 },
              Status: { value: 'PENDING', confidence: 0.96 },
            },
            {
              'Transaction ID': { value: 'TX-9904', confidence: 0.99 },
              'Customer ID': { value: 'CUST-77401', confidence: 0.99 },
              Date: { value: '2026-09-02', confidence: 0.99 },
              Amount: { value: 27600.0, confidence: 0.99 },
              'Payment Method': { value: 'Direct Deposit', confidence: 0.98 },
              Status: { value: 'COMPLETED', confidence: 0.99 },
            },
            {
              'Transaction ID': { value: 'TX-9905', confidence: 0.99 },
              'Customer ID': { value: 'CUST-90124', confidence: 0.98 },
              Date: { value: '2026-09-05', confidence: 0.99 },
              Amount: { value: 11400.0, confidence: 0.98 },
              'Payment Method': { value: 'ACH Wire Transfer', confidence: 0.97 },
              Status: { value: 'COMPLETED', confidence: 0.99 },
            },
          ],
        },
      ],
    },
  },
];
