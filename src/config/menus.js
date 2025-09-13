// src/config/menus.js
export const MENUS = [
    {
      title: 'License 管理',
      icon: 'Key',           // Element Plus 图标名（可选）
      path: '/license',
      children: [
        { title: '注册申请', path: '/license/register' },
        { title: '列表管理', path: '/license/admin' },
      ]
    },
    {
      title: '系统设置',
      icon: 'Setting',
      path: '/system',
      children: [
        { title: '版本信息', path: '/system/version' },
        { title: '关于', path: '/system/about' },
      ]
    }
  ]
  