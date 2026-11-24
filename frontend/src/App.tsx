import { classNames } from './lib/uiStyles';
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
    <div className={classNames('siteShell')}>
      <div className={classNames('utilityBar')}>
        <div className={classNames('container', 'utilityInner')}>
          <span>HỆ SINH THÁI TBT 360 • BIM • CDE • QUẢN LÝ XÂY DỰNG</span>
          <span className={classNames('utilitySecondary')}>
            Tiếng Việt · Hỗ trợ trực tuyến
          </span>
        </div>
      </div>
      <header className={classNames('siteHeader')}>
        <div className={classNames('container', 'headerInner')}>
          <a className={classNames('brand')} href="#home" aria-label="TBT 360 trang chủ">
            <span className={classNames('brandSymbol')}>
              <b>T</b>
              <b className={classNames('brandMiddle')}>B</b>
              <b>T</b>
            </span>
            <span className={classNames('brandSubtitle')}>
              CÔNG NGHỆ VIỆT
              <br />
              CHO CÔNG TRÌNH VIỆT
            </span>
          </a>
          <div className={classNames('headerSearch')}>
            <span className={classNames('headerSearchIcon')} aria-hidden="true">
              ⌕
            </span>
            <input
              className={classNames('headerSearchInput')}
              aria-label="Tìm sản phẩm hoặc bài viết"
              placeholder="Tìm sản phẩm, tài liệu, hướng dẫn..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <div className={classNames('headerAccount')}>
            {isAuthenticated ? (
              <>
                <span className={classNames('accountLabel')}>
                  {currentUser?.name || 'Tài khoản'}
                </span>
                <button className={classNames('headerAccountButton')} type="button" onClick={() => void startLogout()}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <button className={classNames('headerAccountButton')} type="button" onClick={() => void startLogin()}>
                ◯ Đăng nhập
              </button>
            )}
          </div>
          <button
            type="button"
            className={classNames('mobileMenuButton')}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Mở menu"
          >
            ☰
          </button>
        </div>
        <nav className={classNames(
          'mainNav',
          mobileMenuOpen ? 'mainNavOpen' : 'mainNavClosed',
        )}>
          <div className={classNames('container', 'navInner')}>
            {navigationItems.map((navigationItem) =>
            {
              return (
                <a
                  className={classNames(
                    'navLink',
                    currentPage === navigationItem.hash && 'navLinkActive',
                  )}
                  href={navigationItem.hash}
                  key={navigationItem.hash}
                >
                  {navigationItem.label}
                </a>
              );
            })}
            {mobileMenuOpen && !isAuthenticated && (
              <button
                className={classNames('navLogin')}
                type="button"
                onClick={() => void startLogin()}
              >
                Đăng nhập tài khoản
              </button>
            )}
            {mobileMenuOpen && isAuthenticated && (
              <button
                className={classNames('navLogin')}
                type="button"
                onClick={() => void startLogout()}
              >
                Đăng xuất
              </button>
            )}
            {currentUser?.isAdmin && (
              <a
                className={classNames(
                  'navLink',
                  currentPage === '#admin' && 'navLinkActive',
                )}
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
            <div className={classNames('container')}>
              <section className={classNames('introPanel')}>
                <div>
                  <p className={classNames('introEyebrow')}>
                    GIẢI PHÁP QUẢN LÝ XÂY DỰNG
                  </p>
                  <h1 className={classNames('introTitle')}>{settings.siteName}</h1>
                  <p className={classNames('introDescription')}>{settings.slogan}</p>
                  <div className={classNames('heroActions')}>
                    <a className={classNames('primaryButton')} href="#products">
                      Khám phá sản phẩm ↗
                    </a>
                    <a className={classNames('outlineButton')} href="#contact">
                      Liên hệ tư vấn
                    </a>
                  </div>
                </div>
                <div className={classNames('introFeatureList')}>
                  <div className={classNames('introFeature')}>
                    <b className={classNames('introFeatureNumber')}>01</b>
                    <span>Quản lý dự án và thi công</span>
                  </div>
                  <div className={classNames('introFeature')}>
                    <b className={classNames('introFeatureNumber')}>02</b>
                    <span>Hồ sơ nghiệm thu số hóa</span>
                  </div>
                  <div className={classNames('introFeature')}>
                    <b className={classNames('introFeatureNumber')}>03</b>
                    <span>Quản lý mô hình BIM / CDE</span>
                  </div>
                </div>
              </section>
              <div className={classNames('sectionTitleRow')}>
                <div>
                  <p className={classNames('eyebrow')}>KHÁM PHÁ GIẢI PHÁP</p>
                  <h2 className={classNames('sectionTitle')}>Sản phẩm & dịch vụ</h2>
                </div>
                <a className={classNames('textLink')} href="#products">Xem tất cả →</a>
              </div>
              <ProductGrid
                products={filteredProducts.slice(0, 3)}
                onChoose={setSelectedProduct}
              />
              <div className={classNames('sectionTitleRow')}>
                <div>
                  <p className={classNames('eyebrow')}>TÀI NGUYÊN CHUYÊN MÔN</p>
                  <h2 className={classNames('sectionTitle')}>Hướng dẫn & kiến thức</h2>
                </div>
                <a className={classNames('textLink')} href="#articles">Xem tất cả →</a>
              </div>
              <ArticleGrid articles={filteredArticles.slice(0, 3)} />
            </div>
          </>
        )}
        {currentPage === '#products' && (
          <div className={classNames('container', 'pageContent')}>
            <div className={classNames('pageHeading')}>
              <p className={classNames('eyebrow')}>NỀN TẢNG TBT 360</p>
              <h1 className={classNames('pageHeadingTitle')}>Sản phẩm & dịch vụ</h1>
              <p className={classNames('pageHeadingDescription')}>Danh mục được cập nhật trực tiếp từ hệ thống quản trị.</p>
            </div>
            <ProductGrid
              products={filteredProducts}
              onChoose={setSelectedProduct}
            />
          </div>
        )}
        {currentPage === '#articles' && (
          <div className={classNames('container', 'pageContent')}>
            <div className={classNames('pageHeading')}>
              <p className={classNames('eyebrow')}>THƯ VIỆN TBT 360</p>
              <h1 className={classNames('pageHeadingTitle')}>Hướng dẫn sử dụng</h1>
              <p className={classNames('pageHeadingDescription')}>Chia sẻ kiến thức quản lý xây dựng, BIM và CDE.</p>
            </div>
            <ArticleGrid articles={filteredArticles} />
          </div>
        )}
        {currentPage === '#about' && (
          <div className={classNames('container', 'pageContent')}>
            <div className={classNames('pageHeading')}>
              <p className={classNames('eyebrow')}>VỀ CHÚNG TÔI</p>
              <h1 className={classNames('pageHeadingTitle')}>Công nghệ Việt cho công trình Việt</h1>
              <p className={classNames('pageHeadingDescription')}>
                TBT 360 hướng đến kết nối dữ liệu, quy trình nghiệm thu và quản lý
                dự án trên một nền tảng thống nhất, dễ mở rộng.
              </p>
            </div>
            <div className={classNames('aboutGrid')}>
              <article className={classNames('aboutCard')}>
                <span className={classNames('aboutNumber')}>01</span>
                <h3>BIM</h3>
                <p>Mô hình và dữ liệu công trình.</p>
              </article>
              <article className={classNames('aboutCard')}>
                <span className={classNames('aboutNumber')}>02</span>
                <h3>CDE</h3>
                <p>Môi trường dữ liệu chung.</p>
              </article>
              <article className={classNames('aboutCard')}>
                <span className={classNames('aboutNumber')}>03</span>
                <h3>360</h3>
                <p>Quản lý xuyên suốt vòng đời dự án.</p>
              </article>
            </div>
          </div>
        )}
        {currentPage === '#contact' && (
          <div className={classNames('container', 'pageContent', 'contactGrid')}>
            <div>
              <p className={classNames('eyebrow')}>KẾT NỐI VỚI CHÚNG TÔI</p>
              <h1 className={classNames('pageHeadingTitle')}>Liên hệ hỗ trợ</h1>
              <p>Điện thoại: {settings.supportPhone}</p>
              <p>Email: {settings.supportEmail}</p>
            </div>
            <form className={classNames('editorForm')} onSubmit={(event) =>
            {
              event.preventDefault();
              void submitContact(new FormData(event.currentTarget));
            }}>
              <h3 className={classNames('editorFormTitle')}>Gửi yêu cầu</h3>
              <label className={classNames('formField')}>
                Họ và tên<input className={classNames('formInput')} name="fullName" maxLength={120} required />
              </label>
              <label className={classNames('formField')}>
                Email<input className={classNames('formInput')} name="email" type="email" required />
              </label>
              <label className={classNames('formField')}>
                Nội dung<textarea className={classNames('formInput')} name="message" rows={6} required />
              </label>
              {!isAuthenticated && (
                <p className={classNames('smallNote')}>
                  Vui lòng đăng nhập để gửi yêu cầu hỗ trợ.
                </p>
              )}
              <button
                className={classNames('primaryButton')}
                disabled={isSubmitting || !isAuthenticated}
              >
                Gửi liên hệ
              </button>
            </form>
          </div>
        )}
        {currentPage === '#admin' && (
          <div className={classNames('container', 'pageContent')}>
            {currentUser?.isAdmin ? (
              <AdminPanel onContentChanged={reloadPublicData} />
            ) : (
              <div className={classNames('accessPanel')}>
                <h2>Trang quản trị</h2>
                <p>Chỉ tài khoản có quyền admin mới được truy cập.</p>
                {!isAuthenticated && (
                  <button
                    className={classNames('primaryButton')}
                    onClick={() => void startLogin()}
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            )}
          </div>
        )}
        {isLoading && <div className={classNames('loadingNote')}>Đang kết nối dữ liệu...</div>}
        {formMessage && (
          <div className={classNames('feedbackToast')} role="status">
            <span>{formMessage}</span>
            <button className={classNames('feedbackToastClose')} onClick={() => setFormMessage('')} aria-label="Đóng">
              ×
            </button>
          </div>
        )}
      </main>
      <footer className={classNames('siteFooter')}>
        <div className={classNames('container', 'footerGrid')}>
          <div className={classNames('footerColumn')}>
            <strong className={classNames('footerBrand')}>
              TBT <span className={classNames('footerBrandAccent')}>360</span>
            </strong>
            <p className={classNames('footerMuted')}>{settings.slogan}</p>
          </div>
          <div className={classNames('footerColumn')}>
            <b className={classNames('footerHeading')}>Liên kết nhanh</b>
            <a className={classNames('footerMuted')} href="#products">Sản phẩm</a>
            <a className={classNames('footerMuted')} href="#articles">Hướng dẫn</a>
          </div>
          <div className={classNames('footerColumn')}>
            <b className={classNames('footerHeading')}>Hỗ trợ</b>
            <span className={classNames('footerMuted')}>{settings.supportPhone}</span>
            <span className={classNames('footerMuted')}>{settings.supportEmail}</span>
          </div>
        </div>
        <div className={classNames('container', 'footerBottom')}>
          © {new Date().getFullYear()} TBT 360. Nền tảng phát triển độc lập.
        </div>
      </footer>
      {selectedProduct && (
        <div className={classNames('modalOverlay')} role="presentation">
          <form className={classNames('modalPanel')} onSubmit={(event) =>
          {
            event.preventDefault();
            void submitOrder(new FormData(event.currentTarget));
          }}>
            <div className={classNames('sectionTitleRow')}>
              <h2 className={classNames('sectionTitle')}>Đặt hàng / yêu cầu tư vấn</h2>
              <button className={classNames('modalClose')} type="button" onClick={() => setSelectedProduct(null)}>
                ✕
              </button>
            </div>
            <p><strong>{selectedProduct.name}</strong></p>
            <label className={classNames('formField')}>
              Họ tên<input className={classNames('formInput')} name="customerName" required maxLength={120} />
            </label>
            <label className={classNames('formField')}>
              Email<input className={classNames('formInput')} type="email" name="email" required />
            </label>
            <label className={classNames('formField')}>
              Điện thoại<input className={classNames('formInput')} name="phone" required maxLength={30} />
            </label>
            <label className={classNames('formField')}>
              Ghi chú<textarea className={classNames('formInput')} name="note" rows={3} maxLength={1000} />
            </label>
            {!isAuthenticated && (
              <p className={classNames('smallNote')}>
                Để đặt hàng, hãy đăng nhập tài khoản OAuth 2.0 trước.
              </p>
            )}
            <button
              className={classNames('primaryButton')}
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
    return <p className={classNames('emptyState')}>Chưa có sản phẩm phù hợp.</p>;
  }

  return (
    <div className={classNames('productGrid')}>
      {products.map((product) =>
      {
        return (
          <article className={classNames('productCard')} key={product.id}>
            <div className={classNames('productImage')}>
              <img
                className={classNames('productImageElement')}
                src={product.imageUrl || '/banners/product-cover.svg'}
                alt={product.name}
                loading="lazy"
              />
            </div>
            <div className={classNames('productDetail')}>
              <span className={classNames('productCategory')}>GIẢI PHÁP TBT 360</span>
              <h3 className={classNames('productTitle')}>{product.name}</h3>
              <p className={classNames('productDescription')}>{product.description}</p>
              <div className={classNames('productBottom')}>
                <strong className={classNames('productPrice')}>{formatPrice(product.price)}</strong>
                <button className={classNames('productAction')} type="button" onClick={() => onChoose(product)}>
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
    return <p className={classNames('emptyState')}>Chưa có bài viết phù hợp.</p>;
  }

  return (
    <div className={classNames('articleGrid')}>
      {articles.map((article) =>
      {
        return (
          <article className={classNames('articleCard')} key={article.id}>
            <div className={classNames('articleMarker')}>TBT 360 · KIẾN THỨC</div>
            <h3 className={classNames('articleTitle')}>{article.title}</h3>
            <p className={classNames('articleDescription')}>{article.summary}</p>
            <details>
              <summary className={classNames('articleSummary')}>Đọc nội dung →</summary>
              <div className={classNames('articleBody')}>{article.body}</div>
            </details>
          </article>
        );
      })}
    </div>
  );
}
