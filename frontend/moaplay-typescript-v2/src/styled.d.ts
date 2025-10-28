/*
 * styled-components 테마 타입 선언
 * styled-components의 DefaultTheme을 확장하여
 * 커스텀 테마 타입을 정의합니다.
 */

import 'styled-components';
import { Theme } from './styles/theme';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends Theme {}
}