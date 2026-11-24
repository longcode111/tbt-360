import { useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';
import type {
  Article,
  Banner,
  Contact,
  DashboardStats,
  Order,
  Product,
  SiteSettings,
} from '../types/models';

type AdminSection =
  | 'dashboard'
  | 'products'
  | 'articles'
  | 'banners'
  | 'orders'
  | 'contacts'
  | 'settings';

type FormRecord = Record<string, string | number | boolean>;

const adminTabs: { id: AdminSection; title: string; icon: string }[] = [
  { id: 'dashboard', title: 'Tổng quan', icon: '▦' },
  { id: 'products', title: 'Sản phẩm', icon: '▣' },
  { id: 'articles', title: 'Bài viết', icon: '▤' },
  { id: 'banners', title: 'Banner', icon: '▧' },
  { id: 'orders', title: 'Đơn hàng', icon: '▰' },
  { id: 'contacts', title: 'Liên hệ', icon: '✉' },
  { id: 'settings', title: 'Cài đặt', icon: '⚙' },
];

const fieldDefinitions: Record<
  'products' | 'articles' | 'banners',
  { key: string; label: string; type: string }[]
> = {
  products: [
    { key: 'name', label: 'Tên sản phẩm', type: 'text' },
    { key: 'description', label: 'Mô tả', type: 'textarea' },
    { key: 'price', label: 'Giá (VND)', type: 'number' },
    { key: 'imageUrl', label: 'Đường dẫn hình ảnh', type: 'text' },
    { key: 'isPublished', label: 'Hiển thị', type: 'checkbox' },
  ],
  articles: [
    { key: 'title', label: 'Tiêu đề', type: 'text' },
    { key: 'summary', label: 'Tóm tắt', type: 'textarea' },
    { key: 'body', label: 'Nội dung', type: 'textarea' },
    { key: 'isPublished', label: 'Xuất bản', type: 'checkbox' },
  ],
  banners: [
    { key: 'title', label: 'Tên banner', type: 'text' },
    { key: 'imageUrl', label: 'Đường dẫn hình ảnh', type: 'text' },
    { key: 'targetUrl', label: 'Liên kết khi bấm', type: 'text' },
    { key: 'displayOrder', label: 'Thứ tự', type: 'number' },
    { key: 'isPublished', label: 'Hiển thị', type: 'checkbox' },
  ],
};

const defaultForms: Record<
  'products' | 'articles' | 'banners',
  FormRecord
> = {
  products: {
    name: '',
    description: '',
    price: 0,
    imageUrl: '/banners/product-cover.svg',
    isPublished: true,
  },
  articles: {
    title: '',
    summary: '',
    body: '',
    isPublished: true,
  },
  banners: {
    title: '',
    imageUrl: '',
    targetUrl: '#products',
    displayOrder: 0,
    isPublished: true,
  },
};

interface AdminPanelProps {
  onContentChanged: () => Promise<void>;
}

export function AdminPanel({ onContentChanged }: AdminPanelProps)
{
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [dashboard, setDashboard] = useState<DashboardStats | null>(null);
  const [formData, setFormData] = useState<FormRecord | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isWorking, setIsWorking] = useState(false);

  const refreshAdmin = async (): Promise<void> =>
  {
    const [newProducts, newArticles, newBanners, newOrders, newContacts,
      newSettings, newDashboard] = await Promise.all([
      apiRequest<Product[]>('/api/admin/products'),
      apiRequest<Article[]>('/api/admin/articles'),
      apiRequest<Banner[]>('/api/admin/banners'),
      apiRequest<Order[]>('/api/admin/orders'),
      apiRequest<Contact[]>('/api/admin/contacts'),
      apiRequest<SiteSettings>('/api/admin/settings'),
      apiRequest<DashboardStats>('/api/admin/dashboard'),
    ]);

    setProducts(newProducts);
    setArticles(newArticles);
    setBanners(newBanners);
    setOrders(newOrders);
    setContacts(newContacts);
    setSiteSettings(newSettings);
    setDashboard(newDashboard);
  };

  useEffect(() =>
  {
    void refreshAdmin().catch((error: unknown) =>
    {
      setFeedback(`Không tải được dữ liệu: ${String(error)}`);
    });
  }, []);

  const startEdit = (
    section: 'products' | 'articles' | 'banners',
    item?: Product | Article | Banner,
  ): void =>
  {
    setActiveSection(section);
    setEditingId(item?.id ?? null);
    setFormData(item ? { ...item } as FormRecord : { ...defaultForms[section] });
    setFeedback('');
  };

  const saveItem = async (): Promise<void> =>
  {
    if (!formData || !['products', 'articles', 'banners'].includes(activeSection))
    {
      return;
    }

    setIsWorking(true);
    setFeedback('');

    try
    {
      const endpoint = `/api/admin/${activeSection}`;
      const resourceUrl = editingId ? `${endpoint}/${editingId}` : endpoint;

      await apiRequest(resourceUrl, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(formData),
      });

      setFormData(null);
      setEditingId(null);
      await refreshAdmin();
      await onContentChanged();
      setFeedback('Đã lưu thay đổi vào PostgreSQL.');
    }
    catch (error)
    {
      setFeedback(`Không lưu được: ${String(error)}`);
    }
    finally
    {
      setIsWorking(false);
    }
  };

  const removeItem = async (
    section: 'products' | 'articles' | 'banners',
    itemId: string,
  ): Promise<void> =>
  {
    if (!window.confirm('Bạn chắc chắn muốn xóa mục này?'))
    {
      return;
    }

    try
    {
      await apiRequest(`/api/admin/${section}/${itemId}`, {
        method: 'DELETE',
      });
      await refreshAdmin();
      await onContentChanged();
      setFeedback('Đã xóa thành công.');
    }
    catch (error)
    {
      setFeedback(`Không xóa được: ${String(error)}`);
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
  ): Promise<void> =>
  {
    try
    {
      await apiRequest(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await refreshAdmin();
    }
    catch (error)
    {
      setFeedback(`Không cập nhật được: ${String(error)}`);
    }
  };

  const saveSettings = async (): Promise<void> =>
  {
    if (!siteSettings)
    {
      return;
    }

    try
    {
      await apiRequest('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(siteSettings),
      });
      await onContentChanged();
      setFeedback('Đã lưu cấu hình website.');
    }
    catch (error)
    {
      setFeedback(`Không lưu được: ${String(error)}`);
    }
  };

  const catalogData = activeSection === 'products'
    ? products
    : activeSection === 'articles'
      ? articles
      : activeSection === 'banners'
        ? banners
        : [];

  const isCatalog = ['products', 'articles', 'banners'].includes(activeSection);

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-heading">QUẢN TRỊ TBT 360</div>
        {adminTabs.map((tab) =>
        {
          return (
            <button
              type="button"
              key={tab.id}
              onClick={() =>
              {
                setActiveSection(tab.id);
                setFormData(null);
                setFeedback('');
              }}
              className={activeSection === tab.id ? 'selected' : ''}
            >
              <span aria-hidden="true">{tab.icon}</span> {tab.title}
            </button>
          );
        })}
      </aside>
      <section className="admin-content">
        <div className="section-title-row">
          <div>
            <p className="eyebrow">TBT 360 / ADMIN</p>
            <h2>{adminTabs.find((tab) => tab.id === activeSection)?.title}</h2>
          </div>
          {isCatalog && !formData && (
            <button
              className="primary-button"
              type="button"
              onClick={() =>
              {
                startEdit(activeSection as 'products' | 'articles' | 'banners');
              }}
            >
              + Thêm mới
            </button>
          )}
        </div>
        {feedback && <p className="feedback-message" role="status">{feedback}</p>}
        {activeSection === 'dashboard' && (
          <div className="admin-stats">
            {[
              ['Sản phẩm', dashboard?.products],
              ['Bài viết', dashboard?.articles],
              ['Banner', dashboard?.banners],
              ['Đơn hàng', dashboard?.orders],
              ['Liên hệ', dashboard?.contacts],
            ].map(([label, value]) =>
            {
              return (
                <article className="stat-card" key={String(label)}>
                  <strong>{value ?? '—'}</strong>
                  <span>{label}</span>
                </article>
              );
            })}
          </div>
        )}
        {isCatalog && (
          <>
            {formData && (
              <form className="editor-form" onSubmit={(event) =>
              {
                event.preventDefault();
                void saveItem();
              }}>
                <h3>{editingId ? 'Chỉnh sửa' : 'Thêm mới'}</h3>
                {fieldDefinitions[
                  activeSection as 'products' | 'articles' | 'banners'
                ].map((field) =>
                {
                  const currentValue = formData[field.key];
                  return (
                    <label key={field.key} className="form-field">
                      <span>{field.label}</span>
                      {field.type === 'textarea' ? (
                        <textarea
                          rows={field.key === 'body' ? 7 : 3}
                          value={String(currentValue ?? '')}
                          onChange={(event) =>
                          {
                            setFormData({
                              ...formData,
                              [field.key]: event.target.value,
                            });
                          }}
                        />
                      ) : field.type === 'checkbox' ? (
                        <input
                          type="checkbox"
                          checked={Boolean(currentValue)}
                          onChange={(event) =>
                          {
                            setFormData({
                              ...formData,
                              [field.key]: event.target.checked,
                            });
                          }}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={String(currentValue ?? '')}
                          onChange={(event) =>
                          {
                            setFormData({
                              ...formData,
                              [field.key]: field.type === 'number'
                                ? Number(event.target.value)
                                : event.target.value,
                            });
                          }}
                        />
                      )}
                    </label>
                  );
                })}
                {activeSection === 'banners' && Boolean(formData.imageUrl) && (
                  <img
                    className="admin-banner-preview"
                    src={String(formData.imageUrl)}
                    alt="Xem trước banner"
                  />
                )}
                <div className="form-actions">
                  <button className="primary-button" disabled={isWorking}>
                    Lưu thay đổi
                  </button>
                  <button type="button" onClick={() => setFormData(null)}>
                    Hủy
                  </button>
                </div>
              </form>
            )}
            <div className="admin-records">
              {catalogData.map((item) =>
              {
                const itemTitle = 'name' in item
                  ? item.name
                  : item.title;
                const itemDescription = 'description' in item
                  ? item.description
                  : 'summary' in item
                    ? item.summary
                    : item.imageUrl;
                return (
                  <article className="admin-record" key={item.id}>
                    <div>
                      <strong>{itemTitle}</strong>
                      <p>{itemDescription}</p>
                      <span className={item.isPublished
                        ? 'published-pill'
                        : 'hidden-pill'}>
                        {item.isPublished ? 'Đang hiển thị' : 'Đang ẩn'}
                      </span>
                    </div>
                    <div className="record-actions">
                      <button
                        type="button"
                        onClick={() =>
                        {
                          startEdit(
                            activeSection as 'products' | 'articles' | 'banners',
                            item,
                          );
                        }}
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                        {
                          void removeItem(
                            activeSection as 'products' | 'articles' | 'banners',
                            item.id,
                          );
                        }}
                      >
                        Xóa
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
        {activeSection === 'orders' && (
          <div className="admin-records">
            {orders.map((order) =>
            {
              return (
                <article className="admin-record" key={order.id}>
                  <div>
                    <strong>{order.customerName} — {order.productName}</strong>
                    <p>{order.email} · {order.phone} · {order.note}</p>
                    <small>{new Date(order.createdAt).toLocaleString('vi-VN')}</small>
                  </div>
                  <select
                    value={order.status}
                    onChange={(event) =>
                    {
                      void updateOrderStatus(order.id, event.target.value);
                    }}
                  >
                    <option value="new">Mới</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </article>
              );
            })}
          </div>
        )}
        {activeSection === 'contacts' && (
          <div className="admin-records">
            {contacts.map((contact) =>
            {
              return (
                <article className="admin-record" key={contact.id}>
                  <div>
                    <strong>{contact.fullName} — {contact.email}</strong>
                    <p>{contact.message}</p>
                    <small>{new Date(contact.createdAt).toLocaleString('vi-VN')}</small>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {activeSection === 'settings' && siteSettings && (
          <form className="editor-form" onSubmit={(event) =>
          {
            event.preventDefault();
            void saveSettings();
          }}>
            {([
              ['siteName', 'Tên website', 'text'],
              ['slogan', 'Khẩu hiệu', 'text'],
              ['supportEmail', 'Email hỗ trợ', 'email'],
              ['supportPhone', 'Điện thoại', 'text'],
              ['themeColor', 'Màu chủ đạo', 'color'],
            ] as const).map(([fieldKey, fieldLabel, inputType]) =>
            {
              return (
                <label className="form-field" key={fieldKey}>
                  <span>{fieldLabel}</span>
                  <input
                    type={inputType}
                    value={siteSettings[fieldKey]}
                    onChange={(event) =>
                    {
                      setSiteSettings({
                        ...siteSettings,
                        [fieldKey]: event.target.value,
                      });
                    }}
                  />
                </label>
              );
            })}
            <button className="primary-button">Lưu cài đặt</button>
          </form>
        )}
      </section>
    </div>
  );
}
