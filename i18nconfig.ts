import { Locale } from '@/types';
import { Pathnames } from 'next-intl/navigation';

// アプリの対応ロケール
export const locales: Locale[] = ['en-us', 'ja-jp'];

// このロケールにマッチした場合、パス名は接頭辞なしで動作する
// (例 `/about`)
export const defaultLocale: Locale = 'ja-jp';

// pathnames オブジェクトは、
// ロケールで区切られた内部パスと外部パスのペアを保持する
export const pathnames = {
  // すべてのロケールで同じパス名を使用する場合、
  // 単一の外部パスを指定できる
  '/': '/',

  // ロケールが異なるパスを使用する場合、
  // ロケールごとに各外部パスを指定できる
  //   "/about": {
  //     en: '/about',
  //     de: '/ueber-uns'
  //   },
} satisfies Pathnames<typeof locales>;
