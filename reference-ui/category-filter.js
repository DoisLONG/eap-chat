(function () {
  const tree = [
    { value: '产品', children: ['AI Portal', 'AI Hub', 'BEAT', 'BAMS'] },
    { value: '运营', children: ['公司章程'] },
    { value: '技术', children: ['K8s'] }
  ];
  const primary = value => {
    const text = String(value || '').trim(), lower = text.toLowerCase();
    if (text === '产品' || lower === 'product') return '产品';
    if (text === '运营' || lower === 'operation' || lower === 'operations') return '运营';
    if (text === '技术' || lower === 'tech' || lower === 'technology') return '技术';
    return text;
  };
  const secondary = value => String(value || '').trim().toLowerCase() === 'k8s' ? 'K8s' : String(value || '').trim();
  const css = '<style>.category-filter{margin-top:12px}.category-primary-tabs,.category-secondary-tabs{display:flex;flex-wrap:wrap;gap:8px}.category-secondary-tabs{margin-top:10px;padding:10px 12px;border-radius:8px;background:#f6f8fc}.category-tab,.category-subtab{height:36px;padding:0 17px;border:1px solid transparent;border-radius:8px;background:#f1f4f8;color:#475467;cursor:pointer;font:inherit}.category-tab:hover{background:#eaf3ff;color:#1677ff}.category-tab.active{background:#1677ff;color:#fff}.category-subtab{height:32px;padding:0 14px;border-color:#e0e7f0;border-radius:999px;background:#fff;font-size:12px}.category-subtab.active{border-color:#91bfff;background:#eaf3ff;color:#1677ff}</style>';
  function mount(host, onChange) {
    if (!document.getElementById('category-filter-style')) {
      document.head.insertAdjacentHTML('beforeend', css.replace('<style>', '<style id="category-filter-style">'));
    }
    const box = document.createElement('div');
    box.className = 'category-filter';
    box.innerHTML = '<div class="category-primary-tabs"></div><div class="category-secondary-tabs" hidden></div>';
    host.appendChild(box);
    let selectedPrimaryCategory = '', selectedSecondaryCategory = '';
    const primaryBox = box.firstElementChild, secondaryBox = box.lastElementChild;
    const set = (value, sub) => {
      selectedPrimaryCategory = primary(value); selectedSecondaryCategory = secondary(sub);
      primaryBox.innerHTML = ['全部', ...tree.map(item => item.value)].map(value => `<button type="button" class="category-tab ${(!selectedPrimaryCategory && value === '全部') || selectedPrimaryCategory === value ? 'active' : ''}" data-category="${value === '全部' ? '' : value}">${value}</button>`).join('');
      const current = tree.find(item => item.value === selectedPrimaryCategory);
      if (!current) { secondaryBox.hidden = true; secondaryBox.innerHTML = ''; }
      else { secondaryBox.hidden = false; secondaryBox.innerHTML = [`全部${current.value}`, ...current.children].map(value => `<button type="button" class="category-subtab ${(!selectedSecondaryCategory && value === `全部${current.value}`) || selectedSecondaryCategory === value ? 'active' : ''}" data-category="${value.startsWith('全部') ? '' : value}">${value}</button>`).join(''); }
    };
    primaryBox.onclick = event => { const button = event.target.closest('[data-category]'); if (!button) return; set(button.dataset.category, ''); onChange(); };
    secondaryBox.onclick = event => { const button = event.target.closest('[data-category]'); if (!button) return; selectedSecondaryCategory = secondary(button.dataset.category); set(selectedPrimaryCategory, selectedSecondaryCategory); onChange(); };
    set('', '');
    return {
      get primary() { return selectedPrimaryCategory; }, get secondary() { return selectedSecondaryCategory; },
      reset() { set('', ''); },
      matches(record) { const records = Array.isArray(record) ? record : [record]; return !selectedPrimaryCategory || records.some(item => { const main = primary(item && item.primary); const sub = secondary(item && item.secondary); return main === selectedPrimaryCategory && (!selectedSecondaryCategory || sub === selectedSecondaryCategory); }); },
      normalizePrimary: primary, normalizeSecondary: secondary
    };
  }
  window.BluedotCategoryFilter = { mount, primary, secondary };
}());
