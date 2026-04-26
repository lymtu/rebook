import { test, expect } from '@playwright/test';

test.describe('用户站主流程', () => {
  test('注册、分类页、登出再登录', async ({ page }) => {
    const username = `e2e_${Date.now()}`;
    const password = 'password123';
    const nickname = 'E2E用户';

    await page.goto('/register');
    await expect(page.getByRole('heading', { name: '创建 ReBook 账号' })).toBeVisible();

    await page.getByRole('textbox', { name: '用户名' }).fill(username);
    await page.getByRole('textbox', { name: '昵称（选填）' }).fill(nickname);
    await page.getByRole('textbox', { name: '密码' }).fill(password);
    await page.getByRole('button', { name: '注册' }).click();

    await expect(page).toHaveURL('/', { timeout: 25_000 });
    await expect(page.getByRole('link', { name: '买卖记录' })).toBeVisible({ timeout: 10_000 });

    await page.goto('/categories');
    await expect(page.getByRole('heading', { name: '分类' })).toBeVisible();

    await page.getByRole('button', { name: new RegExp(nickname) }).click();
    await page.getByRole('menuitem', { name: '登出' }).click();

    await expect(page.getByRole('link', { name: '登录' })).toBeVisible({ timeout: 10_000 });

    await page.goto('/login');
    await page.getByRole('textbox', { name: '账号' }).fill(username);
    await page.getByRole('textbox', { name: '密码' }).fill(password);
    await page.getByRole('button', { name: '登录' }).click();

    await expect(page).toHaveURL('/', { timeout: 20_000 });
    await expect(page.getByRole('link', { name: '买卖记录' })).toBeVisible();
  });
});
