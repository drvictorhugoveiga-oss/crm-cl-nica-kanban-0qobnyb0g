import { format } from 'date-fns'
import { Lead } from '@/types'

const getHeaders = () => [
  'Nome',
  'Email',
  'Telefone',
  'Origem',
  'Status',
  'Valor',
  'Custo',
  'Criado em',
  'Consentimento LGPD',
]

const getRows = (leads: Lead[]) => {
  return leads.map((l) => [
    l.name,
    l.email || '',
    l.phone || '',
    l.origin || '',
    l.stage || '',
    l.value?.toString() || '0',
    l.cost?.toString() || '0',
    format(new Date(l.created_at), 'dd/MM/yyyy HH:mm'),
    l.lgpd_consent ? 'Sim' : 'Não',
  ])
}

const downloadBlob = (blob: Blob, filename: string) => {
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export const exportToCSV = (filename: string, leads: Lead[]) => {
  const headers = getHeaders()
  const rows = getRows(leads)

  const csvContent = [
    headers.join(';'),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';')),
  ].join('\n')

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}.csv`)
}

export const exportToExcel = (filename: string, leads: Lead[]) => {
  const headers = getHeaders()
  const rows = getRows(leads)

  const html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Leads</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
    </head>
    <body>
      <table border="1">
        <thead>
          <tr>${headers.map((h) => `<th style="background-color: #f3f4f6; font-weight: bold;">${h}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
  downloadBlob(blob, `${filename}.xls`)
}
