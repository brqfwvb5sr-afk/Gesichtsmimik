import { expect, test } from '@playwright/test'

test('loads, navigates and preserves hash routing', async ({ page }) => {
  await page.goto('')
  await expect(page.getByRole('heading', { name: 'Zugang erforderlich' })).toBeVisible()
  await page.getByLabel('Zugangscode').fill('Penis')
  await page.getByRole('button', { name: 'Zugang öffnen' }).click()
  await expect(page.getByRole('heading', { name: /Veränderungen sehen/i })).toBeVisible()
  await page.getByRole('link', { name: 'Wie es funktioniert' }).click()
  await expect(page).toHaveURL(/#\/erklaerung/)
  await expect(page.getByRole('heading', { name: 'Ein Vergleich, keine Diagnose' })).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Ein Vergleich, keine Diagnose' })).toBeVisible()
})

test('settings work locally on mobile', async ({ page }) => {
  await page.goto('#/einstellungen')
  await page.getByLabel('Zugangscode').fill('Penis')
  await page.getByRole('button', { name: 'Zugang öffnen' }).click()
  await page.getByLabel(/Stimmanalyse/).uncheck()
  await page.reload()
  await expect(page.getByLabel(/Stimmanalyse/)).not.toBeChecked()
})
