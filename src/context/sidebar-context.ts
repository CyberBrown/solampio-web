import { createContextId } from '@builder.io/qwik';
import type { Signal } from '@builder.io/qwik';

export interface SidebarState {
  visible: Signal<boolean>;
  enabled: Signal<boolean>; // true when on a page with sidebar
}

export const SidebarContext = createContextId<SidebarState>('sidebar-context');
