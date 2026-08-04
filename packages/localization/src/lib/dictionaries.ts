/**
 * Localization — en/vi v1 (de later). Key-based, typed.
 */

export type Locale = 'en' | 'vi';

export const locales: Locale[] = ['en', 'vi'];

export const defaultLocale: Locale = 'en';

export interface Dictionary {
  [key: string]: string | Dictionary;
}

const en: Dictionary = {
  brand: {
    name: 'StartinDE',
    tagline: 'Your verified personal path to Germany',
  },
  hero: {
    title: 'Build your personal path to Germany',
    subtitle:
      'StartinDE combines official German information, personalised AI guidance, document readiness tools, and qualified human support to help you study, work, train, and settle in Germany.',
    cta: 'Start My Plan',
    secondary: 'Take the free assessment',
  },
  goals: {
    study: 'Study in Germany',
    work: 'Work in Germany',
    ausbildung: 'Find an Ausbildung',
    job: 'Search for a job',
    family: 'Join family',
    business: 'Start a business',
    move: 'Move to Germany',
    situation: 'Check my current situation',
  },
  assessment: {
    title: 'Tell us about yourself',
    next: 'Next',
    back: 'Back',
    submit: 'See my results',
    progress: 'Step {{current}} of {{total}}',
    questions: {
      nationality: 'What is your nationality?',
      residence: 'Where do you currently live?',
      qualification: 'What is your highest qualification?',
      profession: 'What is your profession?',
      experience: 'How much work experience do you have?',
      jobOffer: 'Do you have a job offer?',
      universityAdmission: 'Do you have university admission?',
      salary: 'What salary have you been offered?',
      germanLevel: 'What is your German level?',
      moveDate: 'When do you want to move?',
      family: 'Are you moving alone or with family?',
    },
  },
  result: {
    title: 'Your personal path',
    strongestPathway: 'Your strongest pathway',
    readiness: 'Readiness: {{met}} of {{total}} requirements completed',
    unresolved: 'Main unresolved items',
    alternative: 'Alternative pathway',
    nextAction: 'Recommended next action',
    disclaimer:
      'Based on the information supplied, this pathway may be relevant. The official authority makes the final determination.',
    sources: 'Official sources',
    services: 'Services that can help',
  },
  trust: {
    official: 'Based on official German sources',
    lastVerified: 'Last verified: {{date}}',
    generalInfo: 'General information — not legal advice',
  },
  nav: {
    study: 'Study',
    work: 'Work',
    ausbildung: 'Ausbildung',
    visa: 'Visa and Residence',
    living: 'Living in Germany',
    updates: 'Germany Updates',
    services: 'Services',
    about: 'About',
  },
};

const vi: Dictionary = {
  brand: {
    name: 'StartinDE',
    tagline: 'Con đường xác thực của bạn đến Đức',
  },
  hero: {
    title: 'Xây dựng con đường cá nhân đến Đức',
    subtitle:
      'StartinDE kết hợp thông tin chính thức của Đức, hướng dẫn AI cá nhân hoá, công cụ kiểm tra hồ sơ và hỗ trợ chuyên gia để giúp bạn học tập, làm việc, đào tạo và định cư tại Đức.',
    cta: 'Bắt đầu kế hoạch',
    secondary: 'Làm bài đánh giá miễn phí',
  },
  goals: {
    study: 'Học tập tại Đức',
    work: 'Làm việc tại Đức',
    ausbildung: 'Tìm chương trình Ausbildung',
    job: 'Tìm việc làm',
    family: 'Đoàn tụ gia đình',
    business: 'Khởi nghiệp',
    move: 'Chuyển đến Đức',
    situation: 'Kiểm tra tình trạng hiện tại',
  },
  assessment: {
    title: 'Hãy cho chúng tôi biết về bạn',
    next: 'Tiếp theo',
    back: 'Quay lại',
    submit: 'Xem kết quả của tôi',
    progress: 'Bước {{current}} / {{total}}',
    questions: {
      nationality: 'Quốc tịch của bạn là gì?',
      residence: 'Bạn hiện sống ở đâu?',
      qualification: 'Bằng cấp cao nhất của bạn là gì?',
      profession: 'Nghề nghiệp của bạn là gì?',
      experience: 'Bạn có bao nhiêu năm kinh nghiệm?',
      jobOffer: 'Bạn đã có lời mời làm việc chưa?',
      universityAdmission: 'Bạn đã được nhận vào trường đại học chưa?',
      salary: 'Mức lương được đề nghị là bao nhiêu?',
      germanLevel: 'Trình độ tiếng Đức của bạn?',
      moveDate: 'Bạn muốn chuyển đi khi nào?',
      family: 'Bạn đi một mình hay cùng gia đình?',
    },
  },
  result: {
    title: 'Con đường của bạn',
    strongestPathway: 'Lộ trình phù hợp nhất',
    readiness: 'Mức sẵn sàng: {{met}}/{{total}} yêu cầu đã hoàn thành',
    unresolved: 'Các mục chưa hoàn thành',
    alternative: 'Lộ trình thay thế',
    nextAction: 'Bước tiếp theo nên làm',
    disclaimer:
      'Dựa trên thông tin đã cung cấp, lộ trình này có thể phù hợp. Cơ quan chức năng chính thức là bên quyết định cuối cùng.',
    sources: 'Nguồn chính thức',
    services: 'Dịch vụ hỗ trợ',
  },
  trust: {
    official: 'Dựa trên nguồn chính thức của Đức',
    lastVerified: 'Cập nhật lần cuối: {{date}}',
    generalInfo: 'Thông tin chung — không phải tư vấn pháp lý',
  },
  nav: {
    study: 'Học tập',
    work: 'Làm việc',
    ausbildung: 'Ausbildung',
    visa: 'Visa và Cư trú',
    living: 'Sống tại Đức',
    updates: 'Cập nhật về Đức',
    services: 'Dịch vụ',
    about: 'Giới thiệu',
  },
};

export const dictionaries: Record<Locale, Dictionary> = { en, vi };

/** Shallow lookup helper for templates like "Step {{current}} of {{total}}". */
export function t(
  dict: Dictionary,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const value = key.split('.').reduce<Dictionary | string | undefined>((acc, part) => {
    if (typeof acc === 'object' && acc !== null) return acc[part] as Dictionary | undefined;
    return undefined;
  }, dict);
  if (typeof value !== 'string') return key;
  if (!vars) return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) => String(vars[name] ?? ''));
}
