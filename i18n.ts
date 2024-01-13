import { getRequestConfig } from 'next-intl/server';

// このコンフィグレーションをリクエストごとに1回作成し
// すべてのサーバーコンポーネントで利用できるようする
export default getRequestConfig(async ({ locale }) => {
  return {
    // アクティブなロケールの翻訳を読み込む
    messages: (await import(`./translations/${locale}.json`)).default,
  };
});
