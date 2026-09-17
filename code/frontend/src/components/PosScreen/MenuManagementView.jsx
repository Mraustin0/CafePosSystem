import { useState, useEffect, useCallback, useMemo } from 'react';
import './PromotionView.css';
import { listProducts, setProductStatus } from '../../api/products';

const NAV_TO_CATEGORY_NAME = { coffee: 'Coffee', tea: 'Tea', snack: 'Bakery' };

export default function MenuManagementView({ onOpenAddMenuModal, onEditMenu }) {
  const [menu, setMenu] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [searchText, setSearchText] = useState('');

  const load = useCallback(async () => {
    try {
      // No `active` filter -> backend returns both active + inactive so we can toggle.
      const page = await listProducts({ size: 200 });
      const items = (page?.content ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price != null ? Number(p.price) : 0,
        imgSrc: p.imageUrl ?? null,
        active: p.active,
        categoryId: p.category?.id ?? null,
        categoryName: p.category?.name ?? null,
      }));
      setMenu(items);
      setLoadError(null);
    } catch (err) {
      console.error('listProducts failed:', err);
      setLoadError(err?.message ?? 'โหลดเมนูไม่สำเร็จ');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Parent (PosScreen) dispatches this after add/edit to refresh.
  useEffect(() => {
    const handler = () => load();
    window.addEventListener('products:reload', handler);
    return () => window.removeEventListener('products:reload', handler);
  }, [load]);

  const filteredMenu = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return menu.filter((item) => {
      if (categoryFilter !== 'all' && item.categoryName !== NAV_TO_CATEGORY_NAME[categoryFilter]) return false;
      if (statusFilter === 'ACTIVE' && !item.active) return false;
      if (statusFilter === 'INACTIVE' && item.active) return false;
      if (q && !item.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [menu, categoryFilter, statusFilter, searchText]);

  const toggleStatus = async (item) => {
    setBusy(true);
    try {
      await setProductStatus(item.id, !item.active);
      await load();
    } catch (err) {
      console.error('setProductStatus failed:', err);
      alert(err?.message ?? 'เปลี่ยนสถานะไม่สำเร็จ');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="promo-view" style={{ width: '100%' }}>
      <header className="promo-header" style={{ alignItems: 'center', marginBottom: '16px' }}>
        <div className="promo-header-info">
          <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px 0', color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            จัดการเมนู <span>(Menu Management)</span>
          </h2>
        </div>

        <div className="promo-toolbar" style={{ margin: 0, alignItems: 'center' }}>
          <div className="pos-search pos-search--inline" style={{ margin: '0 16px 0 0', maxWidth: '340px', width: '340px' }}>
            <svg className="pos-search__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="ค้นหาเมนู (Search menu)..."
                   value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          </div>

          <div className="promo-filter">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>
            <select style={{ border: 'none', background: 'transparent', outline: 'none', fontWeight: 600, color: 'var(--gray-900)', fontSize: '13px', cursor: 'pointer' }}
                    value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">ทั้งหมด</option>
              <option value="ACTIVE">เปิดใช้งาน (Active)</option>
              <option value="INACTIVE">ปิดใช้งาน (Inactive)</option>
            </select>
          </div>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { id: 'all', label: 'ทั้งหมด (All)' },
          { id: 'coffee', label: 'กาแฟ (Coffee)' },
          { id: 'tea', label: 'ชา (Tea)' },
          { id: 'snack', label: 'ขนม (Bakery)' }
        ].map((tab) => (
          <button key={tab.id}
                  onClick={() => setCategoryFilter(tab.id)}
                  style={{
                    padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--gray-200)',
                    background: categoryFilter === tab.id ? 'var(--gray-900)' : '#fff',
                    color: categoryFilter === tab.id ? '#fff' : 'var(--gray-600)',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease'
                  }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loadError && <p style={{ color: '#c0392b' }}>{loadError}</p>}

      <div className="pos-menu__grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', paddingBottom: '24px' }}>
        {categoryFilter === 'all' && (
          <article className="pos-card pos-card--add" onClick={onOpenAddMenuModal}>
            <div className="pos-card__add-content">
              <div className="pos-card__add-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
              </div>
              <span className="pos-card__add-text">เพิ่มเมนูใหม่</span>
              <span className="pos-card__add-subtext">(คลิกเพื่อเปิดฟอร์ม)</span>
            </div>
          </article>
        )}

        {filteredMenu.map((item) => (
          <article className="pos-card" key={item.id} style={{ opacity: item.active ? 1 : 0.5, transition: '0.2s' }}>
            <div className="pos-card__image">
              {item.imgSrc && <img src={item.imgSrc} alt={item.name} className="pos-real-image" />}
            </div>
            <div className="pos-card__body">
              <h3>{item.name}</h3>
              <div style={{ fontSize: 12, color: 'var(--gray-600)', marginBottom: 8 }}>
                ฿{item.price.toFixed(2)} · {item.categoryName ?? '—'}
              </div>
              <div className="pos-card__row" style={{ marginTop: 'auto', justifyContent: 'flex-start', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label className="toggle-switch" style={{ margin: 0, transform: 'scale(0.9)', transformOrigin: 'left center' }}>
                    <input type="checkbox" checked={item.active} onChange={() => toggleStatus(item)} disabled={busy} />
                    <span className="slider"></span>
                  </label>
                  <button className="icon-btn"
                          onClick={() => onEditMenu && onEditMenu(item)}
                          title="แก้ไขเมนู"
                          disabled={busy}
                          style={{ background: 'var(--gray-100)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gray-600)', transition: '0.2s', cursor: 'pointer', border: 'none' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}

        {filteredMenu.length === 0 && !loadError && (
          <div style={{ gridColumn: '1 / -1', padding: 32, textAlign: 'center', color: '#666' }}>
            ไม่มีเมนูที่ตรงกับตัวกรอง
          </div>
        )}
      </div>
    </div>
  );
}
