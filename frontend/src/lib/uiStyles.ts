/**
 * Shared Tailwind utility compositions for the TBT 360 frontend.
 *
 * Keep reusable design tokens here instead of restoring the legacy CSS file.
 * Tailwind v4 scans these literal class strings at build time.
 * The main brand color is supplied by the Admin settings via --primary.
 */
export const uiStyles = {
  siteShell: 'min-h-screen bg-[#f7f8fb] font-sans text-[#17213b]',
  container: `
    mx-auto w-[calc(100%_-_28px)] max-w-[1240px]
    sm:w-[calc(100%_-_42px)]
  `,
  utilityBar: 'bg-[#082452] text-[11px] tracking-[0.8px] text-[#cbd7e7]',
  utilityInner: `
    flex min-h-[30px] items-center justify-between gap-5
    max-[700px]:text-[9px]
  `,
  utilitySecondary: 'max-[700px]:hidden',
  siteHeader: 'relative z-10 bg-white shadow-[0_3px_17px_rgb(16_26_48_/_8%)]',
  headerInner: `
    flex min-h-[66px] items-center justify-between gap-5 md:min-h-24
  `,
  brand: 'flex shrink-0 items-center gap-3.5',
  brandSymbol: `
    flex text-[43px] leading-none font-black tracking-[-5px] italic
    text-[#0b2e68] md:text-[50px]
  `,
  brandMiddle: 'text-[var(--primary)]',
  brandSubtitle: `
    hidden text-[10px] leading-[1.6] font-extrabold tracking-[0.8px]
    text-[#153d72] min-[701px]:block
  `,
  headerSearch: `
    hidden w-[38%] items-center rounded-lg border border-[#e6eaf0]
    bg-[#f6f8fb] px-[18px] min-[701px]:flex lg:w-[45%]
  `,
  headerSearchIcon: 'text-[30px] text-[#637084]',
  headerSearchInput: `
    min-h-[46px] w-full border-0 bg-transparent pl-3 text-[#24314a]
    outline-none
  `,
  headerAccount: 'hidden items-center gap-2.5 min-[701px]:flex',
  headerAccountButton: `
    rounded-[7px] border border-[var(--primary)] bg-white px-[18px]
    py-[11px] font-bold text-[var(--primary)] transition-colors
    hover:bg-[#fff4f4]
  `,
  accountLabel: 'text-[13px] text-[#384760]',
  mobileMenuButton: 'bg-transparent text-[27px] min-[701px]:hidden',
  mainNav: 'bg-[var(--primary)] text-white min-[701px]:block',
  mainNavOpen: 'block',
  mainNavClosed: 'hidden',
  navInner: `
    flex flex-col items-stretch min-[701px]:flex-row
    min-[701px]:items-center
  `,
  navLink: `
    block px-[13px] py-[13px] text-left text-sm font-bold
    transition-colors hover:bg-black/15 min-[701px]:px-6
    min-[701px]:py-[18px]
  `,
  navLinkActive: 'bg-black/15',
  navLogin: `
    px-[13px] py-[13px] text-left font-bold text-white hover:bg-black/15
  `,
  bannerCarousel: 'bg-[#e8f0f9]',
  bannerImageFrame: `
    relative h-[max(114px,28vw)] overflow-hidden
    min-[701px]:h-[clamp(205px,26.3vw,500px)]
  `,
  bannerSlide: `
    absolute inset-0 flex items-center justify-center
    transition-opacity duration-500 ease-in-out
  `,
  bannerSlideActive: 'pointer-events-auto opacity-100',
  bannerSlideInactive: 'pointer-events-none opacity-0',
  bannerSlideImage: 'h-full w-full object-contain',
  bannerArrow: `
    absolute top-1/2 z-[2] h-9 w-[27px] -translate-y-1/2 rounded-[7px]
    bg-[#011935]/45 text-2xl text-white hover:bg-[#011935]/70
    min-[701px]:h-12 min-[701px]:w-[42px] min-[701px]:text-[35px]
  `,
  bannerArrowPrevious: 'left-1.5 min-[701px]:left-7',
  bannerArrowNext: 'right-1.5 min-[701px]:right-7',
  bannerDots: 'flex h-[29px] items-center justify-center gap-[9px]',
  bannerDot: 'h-[9px] w-[9px] rounded-full transition-all',
  bannerDotInactive: 'bg-[#9aaabd]',
  bannerDotActive: 'w-[22px] rounded-[10px] bg-[var(--primary)]',
  introPanel: `
    my-[21px] grid grid-cols-1 gap-5 rounded-[14px] bg-gradient-to-br
    from-[#062759] to-[#124781] p-[27px] text-white min-[701px]:my-10
    min-[701px]:mb-14 min-[701px]:grid-cols-[1.45fr_1fr] min-[701px]:p-8
    lg:gap-[45px] lg:p-[42px_48px]
  `,
  introTitle: `
    mb-3 text-4xl leading-[1.1] font-extrabold tracking-[-1px]
    lg:text-[clamp(36px,4vw,56px)]
  `,
  introDescription: 'mb-7 text-[17px] text-[#d7e5f5]',
  introEyebrow: 'text-xs font-extrabold tracking-[1.8px] text-[#8acaff]',
  eyebrow: 'text-xs font-extrabold tracking-[1.8px] text-[var(--primary)]',
  heroActions: 'flex flex-wrap items-center gap-3.5',
  primaryButton: `
    inline-flex min-h-[43px] cursor-pointer items-center justify-center
    rounded-[7px] border border-transparent bg-[var(--primary)]
    px-[19px] py-3 text-[13px] font-bold text-white transition-opacity
    hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50
  `,
  outlineButton: `
    inline-flex min-h-[43px] items-center justify-center rounded-[7px]
    border border-[#b8d8fc] px-[19px] py-3 text-[13px] font-bold
    text-[#eef5ff] transition-colors hover:bg-white/10
  `,
  introFeatureList: 'grid content-center gap-3',
  introFeature: `
    flex items-center gap-[15px] rounded-[9px] border border-white/15
    bg-white/10 px-[21px] py-[17px]
  `,
  introFeatureNumber: 'text-[21px] font-bold text-[#80c4ff]',
  sectionTitleRow: `
    my-[15px] mb-6 flex flex-wrap items-center justify-between gap-2
    min-[701px]:gap-5
  `,
  sectionTitle: `
    mt-[5px] text-[clamp(26px,3vw,34px)] font-bold text-[#092b5e]
  `,
  textLink: 'text-sm font-bold text-[var(--primary)] hover:underline',
  productGrid: `
    mb-[58px] grid grid-cols-1 gap-[23px] min-[701px]:grid-cols-2
    lg:grid-cols-3
  `,
  productCard: `
    min-w-0 overflow-hidden rounded-xl border border-[#e6eaf0] bg-white
    shadow-[0_4px_13px_rgb(7_36_65_/_4%)]
  `,
  productImage: 'flex h-[206px] items-center justify-center bg-[#f4f7fc]',
  productImageElement: 'h-full w-full object-contain',
  productDetail: 'p-[21px]',
  productCategory: `
    text-[10px] font-extrabold tracking-[1.1px] text-[var(--primary)]
  `,
  productTitle: 'my-2.5 text-[19px] leading-[1.4] font-bold text-[#0c2d5f]',
  productDescription: 'min-h-[65px] text-[13px] leading-[1.8] text-[#637084]',
  productBottom: `
    flex flex-wrap items-center justify-between gap-5 border-t
    border-[#e6eaf0] pt-[17px]
  `,
  productPrice: 'font-bold text-[var(--primary)]',
  productAction: 'text-xs font-bold text-[#0e4882] hover:underline',
  articleGrid: `
    mb-[58px] grid grid-cols-1 gap-[23px] min-[701px]:grid-cols-2
    lg:grid-cols-3
  `,
  articleCard: `
    min-w-0 overflow-hidden rounded-xl border border-[#e6eaf0]
    border-t-4 border-t-[#1162a8] bg-white p-6
    shadow-[0_4px_13px_rgb(7_36_65_/_4%)]
  `,
  articleMarker: `
    text-[10px] font-extrabold tracking-[1.2px] text-[var(--primary)]
  `,
  articleTitle: 'my-2.5 text-[19px] leading-[1.4] font-bold text-[#0c2d5f]',
  articleDescription: 'min-h-[65px] text-[13px] leading-[1.8] text-[#637084]',
  articleSummary: 'cursor-pointer text-[13px] font-bold text-[#0b4c92]',
  articleBody: `
    mt-[15px] whitespace-pre-wrap text-[13px] leading-[1.7]
    text-[#3e4b63]
  `,
  pageContent: 'min-h-[62vh] pt-[52px] pb-16',
  pageHeading: 'mb-9 max-w-[770px]',
  pageHeadingTitle: `
    mt-[5px] text-[clamp(26px,3vw,34px)] font-bold text-[#092b5e]
  `,
  pageHeadingDescription: 'leading-[1.7] text-[#637084]',
  contactGrid: 'grid grid-cols-1 gap-12 min-[701px]:grid-cols-2',
  aboutGrid: 'mb-[58px] grid grid-cols-1 gap-[23px] min-[701px]:grid-cols-3',
  aboutCard: `
    min-w-0 rounded-xl border border-[#e6eaf0] bg-white p-7
    shadow-[0_4px_13px_rgb(7_36_65_/_4%)]
  `,
  aboutNumber: 'text-3xl font-extrabold text-[var(--primary)]',
  editorForm: `
    grid content-start gap-[17px] rounded-[11px] border border-[#e6eaf0]
    bg-white p-[25px]
  `,
  editorFormTitle: 'text-lg font-bold text-[#17213b]',
  formField: 'grid gap-2 text-[13px] font-semibold text-[#34415c]',
  formInput: `
    w-full rounded-[7px] border border-[#dce3ec] bg-white px-[13px] py-3
    text-[#22314d] outline-none focus:border-[var(--primary)]
    focus:ring-2 focus:ring-[var(--primary)]/10
  `,
  formCheckbox: 'h-5 w-5 accent-[var(--primary)]',
  formColor: `
    h-12 w-[74px] cursor-pointer rounded-md border border-[#dce3ec]
    bg-white p-1
  `,
  smallNote: 'text-sm text-[#637084]',
  emptyState: `
    rounded-[10px] border border-dashed border-[#cad6e4] p-[30px]
    text-sm text-[#637084]
  `,
  loadingNote: 'py-5 text-center text-sm text-[#637084]',
  siteFooter: 'bg-[#071f47] pt-[51px] text-[#d2dbeb]',
  footerGrid: `
    grid grid-cols-1 gap-[26px] pb-10
    min-[701px]:grid-cols-[2fr_1fr_1fr] min-[701px]:gap-10
  `,
  footerColumn: 'grid content-start gap-[11px]',
  footerBrand: 'text-3xl font-bold text-white',
  footerBrandAccent: 'text-[#ec3f4a]',
  footerHeading: 'font-bold text-white',
  footerMuted: 'text-[13px] text-[#afc0d9]',
  footerBottom: 'border-t border-white/15 py-[18px] text-xs text-[#88a1c0]',
  adminLayout: `
    grid grid-cols-1 items-start gap-[26px]
    min-[701px]:grid-cols-[225px_minmax(0,1fr)]
  `,
  adminSidebar: `
    grid grid-cols-2 gap-[5px] rounded-[11px] bg-[#0a2c5e] p-[17px]
    min-[701px]:grid-cols-1
  `,
  adminSidebarHeading: `
    col-span-full p-[11px] text-[11px] font-extrabold tracking-[1px]
    text-[#b7d4f5]
  `,
  adminSidebarButton: `
    rounded-[7px] px-3.5 py-[13px] text-left text-[#d7e2f3]
    hover:bg-[#214f89] hover:text-white
  `,
  adminSidebarButtonSelected: 'bg-[#214f89] text-white',
  adminContent: 'min-w-0',
  adminStats: `
    grid grid-cols-1 gap-[15px] min-[701px]:grid-cols-2 lg:grid-cols-3
  `,
  statCard: `
    grid gap-2 rounded-[10px] border border-[#e6eaf0] bg-white p-[27px]
  `,
  statNumber: 'text-[35px] font-bold text-[#0b3c79]',
  statCaption: 'text-[#637084]',
  adminRecords: 'grid gap-3',
  adminRecord: `
    flex flex-col items-start justify-between gap-3 rounded-[10px]
    border border-[#e6eaf0] bg-white p-[22px] min-[701px]:flex-row
    min-[701px]:items-center min-[701px]:gap-[30px]
  `,
  adminRecordDescription: 'break-words text-[13px] text-[#637084]',
  adminSelect: `
    w-full max-w-[170px] rounded-[7px] border border-[#dce3ec] bg-white
    px-[13px] py-3 text-[#22314d]
  `,
  recordActions: 'flex items-center justify-between gap-5',
  secondaryButton: `
    rounded-md border border-[#d7e1ec] bg-white px-[13px] py-[9px]
    text-[#17213b] hover:bg-[#f4f7fc]
  `,
  dangerButton: `
    rounded-md border border-[#d7e1ec] bg-white px-[13px] py-[9px]
    text-[#be1e30] hover:bg-[#fff5f5]
  `,
  publishedPill: `
    inline-block rounded-full bg-[#e7f6ed] px-[9px] py-[5px] text-[11px]
    text-[#227146]
  `,
  hiddenPill: `
    inline-block rounded-full bg-[#f3f3f3] px-[9px] py-[5px] text-[11px]
    text-[#737373]
  `,
  feedbackMessage: `
    rounded-[5px] border-l-[3px] border-[#1873cb] bg-[#e8f3ff] p-3
    text-[13px]
  `,
  adminBannerPreview: 'max-h-[180px] w-full object-contain',
  accessPanel: `
    rounded-[10px] border border-[#e6eaf0] bg-white px-[30px] py-[65px]
    text-center
  `,
  modalOverlay: `
    fixed inset-0 z-25 flex items-center justify-center bg-[#021022]/70
    p-5
  `,
  modalPanel: `
    grid max-h-[90vh] w-full max-w-[550px] gap-3.5 overflow-y-auto
    rounded-xl bg-white p-[27px]
  `,
  modalClose: 'text-xl text-[#17213b] hover:text-[var(--primary)]',
  feedbackToast: `
    fixed right-[18px] bottom-5 z-30 flex max-w-[450px] items-center
    gap-[18px] rounded-[7px] bg-[#0c2d62] p-[15px] text-[13px]
    text-white shadow-[0_10px_30px_rgb(0_0_0_/_18%)]
  `,
  feedbackToastClose: 'text-[22px] text-white',
  formActions: 'flex flex-wrap items-center justify-between gap-5',
} as const;

export type UiStyleName = keyof typeof uiStyles;

export function classNames(
  ...styleNames: Array<UiStyleName | false | null | undefined>
): string
{
  return styleNames
    .filter((styleName): styleName is UiStyleName => Boolean(styleName))
    .map((styleName) => uiStyles[styleName])
    .join(' ');
}
