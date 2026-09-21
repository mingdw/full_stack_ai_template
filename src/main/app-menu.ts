import { BrowserWindow, Menu, MenuItemConstructorOptions, app, shell } from 'electron';

export type AppLocale = 'zh-CN' | 'en';

interface MenuLabels {
  app: string;
  file: string;
  edit: string;
  view: string;
  window: string;
  help: string;
  settings: string;
  language: string;
  zh: string;
  en: string;
  more: string;
  about: string;
  hide: string;
  hideOthers: string;
  showAll: string;
  quit: string;
  close: string;
  undo: string;
  redo: string;
  cut: string;
  copy: string;
  paste: string;
  selectAll: string;
  reload: string;
  forceReload: string;
  toggleDevTools: string;
  resetZoom: string;
  zoomIn: string;
  zoomOut: string;
  togglefullscreen: string;
  minimize: string;
  zoom: string;
  front: string;
  learnMore: string;
}

const MENU_LABELS: Record<AppLocale, MenuLabels> = {
  'zh-CN': {
    app: '本地密码本',
    file: '文件',
    edit: '编辑',
    view: '视图',
    window: '窗口',
    help: '帮助',
    settings: '设置',
    language: '语言',
    zh: '简体中文',
    en: 'English',
    more: '更多…（即将支持）',
    about: '关于本地密码本',
    hide: '隐藏本地密码本',
    hideOthers: '隐藏其他',
    showAll: '显示全部',
    quit: '退出',
    close: '关闭窗口',
    undo: '撤销',
    redo: '重做',
    cut: '剪切',
    copy: '复制',
    paste: '粘贴',
    selectAll: '全选',
    reload: '重新加载',
    forceReload: '强制重新加载',
    toggleDevTools: '切换开发者工具',
    resetZoom: '实际大小',
    zoomIn: '放大',
    zoomOut: '缩小',
    togglefullscreen: '切换全屏',
    minimize: '最小化',
    zoom: '缩放',
    front: '全部置于顶层',
    learnMore: '查看文档',
  },
  en: {
    app: 'Local Password Vault',
    file: 'File',
    edit: 'Edit',
    view: 'View',
    window: 'Window',
    help: 'Help',
    settings: 'Settings',
    language: 'Language',
    zh: '简体中文',
    en: 'English',
    more: 'More… (coming soon)',
    about: 'About Local Password Vault',
    hide: 'Hide Local Password Vault',
    hideOthers: 'Hide Others',
    showAll: 'Show All',
    quit: 'Quit',
    close: 'Close Window',
    undo: 'Undo',
    redo: 'Redo',
    cut: 'Cut',
    copy: 'Copy',
    paste: 'Paste',
    selectAll: 'Select All',
    reload: 'Reload',
    forceReload: 'Force Reload',
    toggleDevTools: 'Toggle Developer Tools',
    resetZoom: 'Actual Size',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    togglefullscreen: 'Toggle Full Screen',
    minimize: 'Minimize',
    zoom: 'Zoom',
    front: 'Bring All to Front',
    learnMore: 'Documentation',
  },
};

export function isAppLocale(value: unknown): value is AppLocale {
  return value === 'zh-CN' || value === 'en';
}

function buildFileMenu(labels: MenuLabels): MenuItemConstructorOptions {
  if (process.platform === 'darwin') {
    return {
      label: labels.file,
      submenu: [{ role: 'close', label: labels.close }],
    };
  }

  return {
    label: labels.file,
    submenu: [
      { role: 'quit', label: labels.quit },
    ],
  };
}

function buildEditMenu(labels: MenuLabels): MenuItemConstructorOptions {
  return {
    label: labels.edit,
    submenu: [
      { role: 'undo', label: labels.undo },
      { role: 'redo', label: labels.redo },
      { type: 'separator' },
      { role: 'cut', label: labels.cut },
      { role: 'copy', label: labels.copy },
      { role: 'paste', label: labels.paste },
      { role: 'selectAll', label: labels.selectAll },
    ],
  };
}

function buildViewMenu(labels: MenuLabels): MenuItemConstructorOptions {
  return {
    label: labels.view,
    submenu: [
      { role: 'reload', label: labels.reload },
      { role: 'forceReload', label: labels.forceReload },
      { role: 'toggleDevTools', label: labels.toggleDevTools },
      { type: 'separator' },
      { role: 'resetZoom', label: labels.resetZoom },
      { role: 'zoomIn', label: labels.zoomIn },
      { role: 'zoomOut', label: labels.zoomOut },
      { type: 'separator' },
      { role: 'togglefullscreen', label: labels.togglefullscreen },
    ],
  };
}

function buildWindowMenu(labels: MenuLabels): MenuItemConstructorOptions {
  const submenu: MenuItemConstructorOptions[] = [
    { role: 'minimize', label: labels.minimize },
  ];

  if (process.platform === 'darwin') {
    submenu.push(
      { role: 'zoom', label: labels.zoom },
      { type: 'separator' },
      { role: 'front', label: labels.front },
    );
  } else {
    submenu.push({ role: 'close', label: labels.close });
  }

  return {
    label: labels.window,
    submenu,
  };
}

function buildHelpMenu(labels: MenuLabels): MenuItemConstructorOptions {
  const submenu: MenuItemConstructorOptions[] = [
    {
      label: labels.about,
      ...(process.platform === 'darwin'
        ? { role: 'about' as const }
        : {
            click: () => {
              // Reserved for a native about dialog.
            },
          }),
    },
    { type: 'separator' },
    {
      label: labels.learnMore,
      click: async () => {
        await shell.openExternal('https://www.electronjs.org/docs');
      },
    },
  ];

  return {
    label: labels.help,
    submenu,
  };
}

function buildSettingsMenu(
  locale: AppLocale,
  labels: MenuLabels,
  onSelectLocale: (next: AppLocale) => void,
): MenuItemConstructorOptions {
  return {
    label: labels.settings,
    submenu: [
      {
        label: labels.language,
        submenu: [
          {
            label: labels.zh,
            type: 'radio',
            checked: locale === 'zh-CN',
            click: () => onSelectLocale('zh-CN'),
          },
          {
            label: labels.en,
            type: 'radio',
            checked: locale === 'en',
            click: () => onSelectLocale('en'),
          },
        ],
      },
      { type: 'separator' },
      {
        label: labels.more,
        enabled: false,
      },
    ],
  };
}

export function buildApplicationMenu(
  locale: AppLocale,
  onSelectLocale: (next: AppLocale) => void,
): Menu {
  const labels = MENU_LABELS[locale];
  const template: MenuItemConstructorOptions[] = [];

  if (process.platform === 'darwin') {
    template.push({
      label: labels.app,
      submenu: [
        { role: 'about', label: labels.about },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide', label: labels.hide },
        { role: 'hideOthers', label: labels.hideOthers },
        { role: 'unhide', label: labels.showAll },
        { type: 'separator' },
        { role: 'quit', label: labels.quit },
      ],
    });
  }

  // Keep product name in sync with locale for window/about surfaces.
  app.setName(labels.app);

  template.push(
    buildFileMenu(labels),
    buildEditMenu(labels),
    buildViewMenu(labels),
    buildWindowMenu(labels),
    buildHelpMenu(labels),
    buildSettingsMenu(locale, labels, onSelectLocale),
  );

  return Menu.buildFromTemplate(template);
}

export function getAppTitle(locale: AppLocale): string {
  return MENU_LABELS[locale].app;
}

export function applyApplicationMenu(
  locale: AppLocale,
  getMainWindow: () => BrowserWindow | null,
  onLocaleChanged: (locale: AppLocale) => void,
): void {
  const menu = buildApplicationMenu(locale, (next) => {
    applyApplicationMenu(next, getMainWindow, onLocaleChanged);
    onLocaleChanged(next);
    const win = getMainWindow();
    win?.setTitle(MENU_LABELS[next].app);
    win?.webContents.send('app:locale-changed', next);
  });
  Menu.setApplicationMenu(menu);
}

/** Auth/setup screens: hide full menu bar (minimal app menu retained on macOS). */
export function applyAuthMenu(locale: AppLocale): void {
  const labels = MENU_LABELS[locale];
  app.setName(labels.app);

  if (process.platform === 'darwin') {
    const menu = Menu.buildFromTemplate([
      {
        label: labels.app,
        submenu: [
          { role: 'about', label: labels.about },
          { type: 'separator' },
          { role: 'hide', label: labels.hide },
          { role: 'hideOthers', label: labels.hideOthers },
          { role: 'unhide', label: labels.showAll },
          { type: 'separator' },
          { role: 'quit', label: labels.quit },
        ],
      },
      {
        label: labels.edit,
        submenu: [
          { role: 'undo', label: labels.undo },
          { role: 'redo', label: labels.redo },
          { type: 'separator' },
          { role: 'cut', label: labels.cut },
          { role: 'copy', label: labels.copy },
          { role: 'paste', label: labels.paste },
          { role: 'selectAll', label: labels.selectAll },
        ],
      },
    ]);
    Menu.setApplicationMenu(menu);
    return;
  }

  Menu.setApplicationMenu(null);
}
