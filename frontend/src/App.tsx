import { useCallback, useEffect, useState } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { BannerCarousel } from './components/BannerCarousel';
import { apiRequest } from './lib/api';
import {
  completeLogin,
  startLogin,
  startLogout,
  userManager,
} from './lib/auth';
import type {
  Article,
  Banner,
  CurrentUser,
  Product,
  SiteSettings,
} from './types/models';

const fallbackBanners: Banner[] = [
  {
    id: 'fallback-one',
    title: 'TBT Việt Nam - BIM CDE 360',
    imageUrl: '/banners/bim-cde-360.png',
    targetUrl: '#products',
    displayOrder: 0,
    isPublished: true,
  },
  {
    id: 'fallback-two',
    title: 'Phần mềm nghiệm thu 360',
    imageUrl: '/banners/nghiem-thu-do.png',
    targetUrl: '#products',
    displayOrder: 1,
    isPublished: true,
  },
  {
    id: 'fallback-three',
    title: 'Nghiệm thu xây dựng 360',
    imageUrl: '/banners/nghiem-thu-xanh.png',
    targetUrl: '#products',
    displayOrder: 2,
    isPublished: true,
  },
];

const fallbackSettings: SiteSettings = {
  siteName: 'TBT 360',
  slogan: 'Công nghệ Việt cho công trình Việt',
  supportEmail: 'contact@example.com',
  supportPhone: 'Đang cập nhật',
  themeColor: '#bd1722',
};

const navigationItems = [
  { hash: '#home', label: 'Trang chủ' },
  { hash: '#products', label: 'Sản phẩm' },
  { hash: '#articles', label: 'Hướng dẫn' },
  { hash: '#about', label: 'Giới thiệu' },
  { hash: '#contact', label: 'Liên hệ' },
];

function getCurrentPage(): string
{
  return window.location.hash || '#home';
}

function formatPrice(price: number): string
{
  if (price <= 0)
  {
    return 'Liên hệ báo giá';
  }

  return `${new Intl.NumberFormat('vi-VN').format(price)} đ`;
}

export function App()
{
  const [currentPage, setCurrentPage] = useState(getCurrentPage);
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [banners, setBanners] = useState<Banner[]>(fallbackBanners);
  const [settings, setSettings] = useState<SiteSettings>(fallbackSettings);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formMessage, setFormMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const reloadPublicData = useCallback(async (): Promise<void> =>
  {
    const [productList, articleList, bannerList, publicSettings] =
      await Promise.all([
        apiRequest<Product[]>('/api/products'),
        apiRequest<Article[]>('/api/articles'),
        apiRequest<Banner[]>('/api/banners'),
        apiRequest<SiteSettings>('/api/settings'),
      ]);

    setProducts(productList);
    setArticles(articleList);
    setBanners(bannerList);
    setSettings(publicSettings);
  }, []);

  const reloadUser = useCallback(async (): Promise<void> =>
  {
    const sessionUser = await userManager.getUser();
    const hasValidSession = Boolean(sessionUser && !sessionUser.expired);
    setIsAuthenticated(hasValidSession);

    if (hasValidSession)
    {
      try
      {
        const userProfile = await apiRequest<CurrentUser>('/api/me');
        setCurrentUser(userProfile);
      }
      catch
      {
        setCurrentUser(null);
      }
    }
    else
    {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() =>
  {
    const handleHashChange = (): void =>
    {
      setCurrentPage(getCurrentPage());
      setMobileMenuOpen(false);
      setFormMessage('');
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() =>
  {
    async function initializeApplication(): Promise<void>
    {
      try
      {
        if (window.location.pathname === '/auth/callback')
        {
          await completeLogin();
        }

        await reloadUser();
        await reloadPublicData();
      }
      catch (error)
      {
        setFormMessage(`Không kết nối được API: ${String(error)}`);
      }
      finally
      {
        setIsLoading(false);
      }
    }

    void initializeApplication();
  }, [reloadPublicData, reloadUser]);

  useEffect(() =>
  {
    document.documentElement.style.setProperty(
      '--primary',
      /^#[0-9a-f]{6}$/i.test(settings.themeColor)
        ? settings.themeColor
        : '#bd1722',
    );
  }, [settings.themeColor]);

  const filteredProducts = products.filter((product) =>
  {
    return product.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredArticles = articles.filter((article) =>
  {
    return article.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const submitOrder = async (formData: FormData): Promise<void> =>
  {
    if (!selectedProduct)
    {
      return;
    }

    setIsSubmitting(true);
    setFormMessage('');

    try
    {
      await apiRequest('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedProduct.id,
          customerName: String(formData.get('customerName') ?? ''),
          email: String(formData.get('email') ?? ''),
          phone: String(formData.get('phone') ?? ''),
          note: String(formData.get('note') ?? ''),
        }),
      });
      setSelectedProduct(null);
      setFormMessage('Đã gửi yêu cầu đặt hàng thành công.');
    }
    catch (error)
    {
      setFormMessage(`Không gửi được đơn hàng: ${String(error)}`);
    }
    finally
    {
      setIsSubmitting(false);
    }
  };

  const submitContact = async (formData: FormData): Promise<void> =>
  {
    setIsSubmitting(true);
    setFormMessage('');

    try
    {
      await apiRequest('/api/contacts', {
        method: 'POST',
        body: JSON.stringify({
          fullName: String(formData.get('fullName') ?? ''),
          email: String(formData.get('email') ?? ''),
          message: String(formData.get('message') ?? ''),
        }),
      });
      setFormMessage('Đã gửi liên hệ thành công.');
    }
    catch (error)
    {
      setFormMessage(`Không gửi được liên hệ: ${String(error)}`);
    }
    finally
    {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="site-shell">
      <div className="utility-bar">
        <div className="container utility-inner">
          <span>HỆ SINH THÁI TBT 360 • BIM • CDE • QUẢN LÝ XÂY DỰNG</span>
          <span>Tiếng Việt · Hỗ trợ trực tuyến</span>
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <a className="brand" href="#home" aria-label="TBT 360 trang chủ">
            <span className="brand-symbol"><b>T</b><b>B</b><b>T</b></span>
            <span className="brand-subtitle">
              CÔNG NGHỆ VIỆT
              <br />
              CHO CÔNG TRÌNH VIỆT
            </span>
          </a>
          <div className="header-search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Tìm sản phẩm hoặc bài viết"
              placeholder="Tìm sản phẩm, tài liệu, hướng dẫn..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className="header-account">
            {isAuthenticated ? (
              <>
                <span className="account-label">
                  {currentUser?.name || 'Tài khoản'}
                </span>
                <button type="button" onClick={() => void startLogout()}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <button type="button" onClick={() => void startLogin()}>
                ◯ Đăng nhập
              </button>
            )}
          </div>
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Mở menu"
          >
            ☰
          </button>
        </div>
        <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <div className="container nav-inner">
            {navigationItems.map((navigationItem) =>
            {
              return (
                <a
                  className={currentPage === navigationItem.hash ? 'active' : ''}
                  href={navigationItem.hash}
                  key={navigationItem.hash}
                >
                  {navigationItem.label}
                </a>
              );
            })}
            {mobileMenuOpen && !isAuthenticated && (
              <button
                className="nav-login"
                type="button"
                onClick={() => void startLogin()}
              >
                Đăng nhập tài khoản
              </button>
            )}
            {mobileMenuOpen && isAuthenticated && (
              <button
                className="nav-login"
                type="button"
                onClick={() => void startLogout()}
              >
                Đăng xuất
              </button>
            )}
            {currentUser?.isAdmin && (
              <a
                className={currentPage === '#admin' ? 'active' : ''}
                href="#admin"
              >
                ⚙ Quản trị
              </a>
            )}
          </div>
        </nav>
      </header>
      <main>
        {currentPage === '#home' && (
          <>
            <BannerCarousel banners={banners} />
            <div className="container">
              <section className="intro-panel">
                <div>
                  <p className="eyebrow">GIẢI PHÁP QUẢN LÝ XÂY DỰNG</p>
                  <h1>{settings.siteName}</h1>
                  <p>{settings.slogan}</p>
                  <div className="hero-actions">
                    <a className="primary-button" href="#products">
                      Khám phá sản phẩm ↗
                    </a>
                    <a className="outline-button" href="#contact">
                      Liên hệ tư vấn
                    </a>
                  </div>
                </div>
                <div className="intro-feature-list">
                  <div><b>01</b><span>Quản lý dự án và thi công</span></div>
                  <div><b>02</b><span>Hồ sơ nghiệm thu số hóa</span></div>
                  <div><b>03</b><span>Quản lý mô hình BIM / CDE</span></div>
                </div>
              </section>
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">KHÁM PHÁ GIẢI PHÁP</p>
                  <h2>Sản phẩm & dịch vụ</h2>
                </div>
                <a className="text-link" href="#products">Xem tất cả →</a>
              </div>
              <ProductGrid
                products={filteredProducts.slice(0, 3)}
                onChoose={setSelectedProduct}
              />
              <div className="section-title-row">
                <div>
                  <p className="eyebrow">TÀI NGUYÊN CHUYÊN MÔN</p>
                  <h2>Hướng dẫn & kiến thức</h2>
                </div>
                <a className="text-link" href="#articles">Xem tất cả →</a>
              </div>
              <ArticleGrid articles={filteredArticles.slice(0, 3)} />
            </div>
          </>
        )}
        {currentPage === '#products' && (
          <div className="container page-content">
            <div className="page-heading">
              <p className="eyebrow">NỀN TẢNG TBT 360</p>
              <h1>Sản phẩm & dịch vụ</h1>
              <p>Danh mục được cập nhật trực tiếp từ hệ thống quản trị.</p>
            </div>
            <ProductGrid
              products={filteredProducts}
              onChoose={setSelectedProduct}
            />
          </div>
        )}
        {currentPage === '#articles' && (
          <div className="container page-content">
            <div className="page-heading">
              <p className="eyebrow">THƯ VIỆN TBT 360</p>
              <h1>Hướng dẫn sử dụng</h1>
              <p>Chia sẻ kiến thức quản lý xây dựng, BIM và CDE.</p>
            </div>
            <ArticleGrid articles={filteredArticles} />
          </div>
        )}
        {currentPage === '#about' && (
          <div className="container page-content">
            <div className="page-heading">
              <p className="eyebrow">VỀ CHÚNG TÔI</p>
              <h1>Công nghệ Việt cho công trình Việt</h1>
              <p>
                TBT 360 hướng đến kết nối dữ liệu, quy trình nghiệm thu và quản lý
                dự án trên một nền tảng thống nhất, dễ mở rộng.
              </p>
            </div>
            <div className="about-grid">
              <article>
                <span>01</span>
                <h3>BIM</h3>
                <p>Mô hình và dữ liệu công trình.</p>
              </article>
              <article>
                <span>02</span>
                <h3>CDE</h3>
                <p>Môi trường dữ liệu chung.</p>
              </article>
              <article>
                <span>03</span>
                <h3>360</h3>
                <p>Quản lý xuyên suốt vòng đời dự án.</p>
              </article>
            </div>
          </div>
        )}
        {currentPage === '#contact' && (
          <div className="container page-content contact-grid">
            <div>
              <p className="eyebrow">KẾT NỐI VỚI CHÚNG TÔI</p>
              <h1>Liên hệ hỗ trợ</h1>
              <p>Điện thoại: {settings.supportPhone}</p>
              <p>Email: {settings.supportEmail}</p>
            </div>
            <form className="editor-form" onSubmit={(event) =>
            {
              event.preventDefault();
              void submitContact(new FormData(event.currentTarget));
            }}>
              <h3>Gửi yêu cầu</h3>
              <label className="form-field">
                Họ và tên<input name="fullName" maxLength={120} required />
              </label>
              <label className="form-field">
                Email<input name="email" type="email" required />
              </label>
              <label className="form-field">
                Nội dung<textarea name="message" rows={6} required />
              </label>
              {!isAuthenticated && (
                <p className="small-note">
                  Vui lòng đăng nhập để gửi yêu cầu hỗ trợ.
                </p>
              )}
              <button
                className="primary-button"
                disabled={isSubmitting || !isAuthenticated}
              >
                Gửi liên hệ
              </button>
            </form>
          </div>
        )}
        {currentPage === '#admin' && (
          <div className="container page-content">
            {currentUser?.isAdmin ? (
              <AdminPanel onContentChanged={reloadPublicData} />
            ) : (
              <div className="access-panel">
                <h2>Trang quản trị</h2>
                <p>Chỉ tài khoản có quyền admin mới được truy cập.</p>
                {!isAuthenticated && (
                  <button
                    className="primary-button"
                    onClick={() => void startLogin()}
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {isLoading && <div className="loading-note">Đang kết nối dữ liệu...</div>}
        {formMessage && (
          <div className="feedback-toast" role="status">
            <span>{formMessage}</span>
            <button onClick={() => setFormMessage('')} aria-label="Đóng">
              ×
            </button>
          </div>
        )}
      </main>
      <footer className="site-footer">
        <div className="container footer-grid">
          <div>
            <strong>TBT <span>360</span></strong>
            <p>{settings.slogan}</p>
          </div>
          <div>
            <b>Liên kết nhanh</b>
            <a href="#products">Sản phẩm</a>
            <a href="#articles">Hướng dẫn</a>
          </div>
          <div>
            <b>Hỗ trợ</b>
            <span>{settings.supportPhone}</span>
            <span>{settings.supportEmail}</span>
          </div>
        </div>
        <div className="container footer-bottom">
          © {new Date().getFullYear()} TBT 360. Nền tảng phát triển độc lập.
        </div>
      </footer>
      {selectedProduct && (
        <div className="modal-overlay" role="presentation">
          <form className="modal-panel" onSubmit={(event) =>
          {
            event.preventDefault();
            void submitOrder(new FormData(event.currentTarget));
          }}>
            <div className="section-title-row">
              <h2>Đặt hàng / yêu cầu tư vấn</h2>
              <button type="button" onClick={() => setSelectedProduct(null)}>
                ✕
              </button>
            </div>
            <p><strong>{selectedProduct.name}</strong></p>
            <label className="form-field">
              Họ tên<input name="customerName" required maxLength={120} />
            </label>
            <label className="form-field">
              Email<input type="email" name="email" required />
            </label>
            <label className="form-field">
              Điện thoại<input name="phone" required maxLength={30} />
            </label>
            <label className="form-field">
              Ghi chú<textarea name="note" rows={3} maxLength={1000} />
            </label>
            {!isAuthenticated && (
              <p className="small-note">
                Để đặt hàng, hãy đăng nhập tài khoản OAuth 2.0 trước.
              </p>
            )}
            <button
              className="primary-button"
              disabled={!isAuthenticated || isSubmitting}
            >
              Gửi yêu cầu
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

interface ProductGridProps {
  products: Product[];
  onChoose: (product: Product) => void;
}

function ProductGrid({ products, onChoose }: ProductGridProps)
{
  if (products.length === 0)
  {
    return <p className="empty-state">Chưa có sản phẩm phù hợp.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) =>
      {
        return (
          <article className="product-card" key={product.id}>
            <div className="product-image">
              <img
                src={product.imageUrl || '/banners/product-cover.svg'}
                alt={product.name}
                loading="lazy"
              />
            </div>
            <div className="product-detail">
              <span className="product-category">GIẢI PHÁP TBT 360</span>
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <div className="product-bottom">
                <strong>{formatPrice(product.price)}</strong>
                <button type="button" onClick={() => onChoose(product)}>
                  Tìm hiểu & đặt hàng →
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ArticleGrid({ articles }: { articles: Article[] })
{
  if (articles.length === 0)
  {
    return <p className="empty-state">Chưa có bài viết phù hợp.</p>;
  }

  return (
    <div className="article-grid">
      {articles.map((article) =>
      {
        return (
          <article className="article-card" key={article.id}>
            <div className="article-marker">TBT 360 · KIẾN THỨC</div>
            <h3>{article.title}</h3>
            <p>{article.summary}</p>
            <details>
              <summary>Đọc nội dung →</summary>
              <div className="article-body">{article.body}</div>
            </details>
          </article>
        );
      })}
    </div>
  );
}
