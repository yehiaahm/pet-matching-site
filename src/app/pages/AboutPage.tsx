import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Heart,
  Target,
  Users,
  Award,
  Shield,
  Zap,
  Globe,
  CheckCircle,
} from 'lucide-react';

export default function AboutPage() {
  const { language } = useLanguage();
  const isArabic = language === 'ar';

  const aboutContent = {
    en: {
      title: 'About PetMate',
      subtitle: 'Connecting Pet Lovers and Breeders Worldwide',
      mission: 'Our Mission',
      missionText:
        'To create a trusted platform that connects passionate pet breeders and enthusiasts, enabling them to find perfect matches and build a thriving community dedicated to animal welfare and genetic excellence.',
      vision: 'Our Vision',
      visionText:
        'A world where every pet breeding decision is informed, ethical, and supported by a community of experts dedicated to producing healthier, happier generations of animals.',
      stats: [
        { number: '50K+', label: 'Active Users' },
        { number: '100K+', label: 'Registered Pets' },
        { number: '10K+', label: 'Successful Matches' },
        { number: '150+', label: 'Countries' },
      ],
      why: 'Why Choose PetMate?',
      features: [
        {
          title: 'AI-Powered Matching',
          description:
            'Advanced algorithms analyze genetics, health, and behavior to find perfect matches',
          icon: Target,
        },
        {
          title: 'Comprehensive Health Records',
          description:
            'Detailed health documentation including vaccination history and vet checkups',
          icon: Shield,
        },
        {
          title: 'Expert Community',
          description:
            'Connect with experienced breeders and get professional advice',
          icon: Users,
        },
        {
          title: 'Verified Profiles',
          description:
            'All breeders are verified to ensure trust and authenticity',
          icon: Award,
        },
        {
          title: 'Global Network',
          description:
            'Connect with breeders and enthusiasts from around the world',
          icon: Globe,
        },
        {
          title: 'Real-Time Notifications',
          description:
            'Get instant updates about matching pets and important updates',
          icon: Zap,
        },
      ],
      values: 'Our Core Values',
      valueList: [
        {
          title: 'Trust & Safety',
          description: 'We prioritize the safety and authenticity of all users',
        },
        {
          title: 'Excellence',
          description:
            'We strive for the highest standards in breeding practices',
        },
        {
          title: 'Community',
          description:
            'We foster a supportive network of passionate animal lovers',
        },
        {
          title: 'Innovation',
          description:
            'We continuously improve our platform with cutting-edge technology',
        },
      ],
      team: 'Our Team',
      teamText:
        'PetMate was founded by a team of passionate pet enthusiasts, veterinarians, and technology experts dedicated to revolutionizing pet breeding.',
      contact: 'Get in Touch',
      contactText: 'Have questions? We\'d love to hear from you.',
      email: 'support@petmate.com',
      phone: '+1 (555) 123-4567',
    },
    ar: {
      title: 'عن بيتمات',
      subtitle: 'ربط عشاق الحيوانات الأليفة والمربيين في جميع أنحاء العالم',
      mission: 'مهمتنا',
      missionText:
        'إنشاء منصة موثوقة تربط بين مربيي الحيوانات الأليفة المتحمسين والمهتمين، مما يمكنهم من إيجاد تطابقات مثالية وبناء مجتمع مزدهر مكرس لرعاية الحيوان والتميز الجيني.',
      vision: 'رؤيتنا',
      visionText:
        'عالم حيث تكون كل قرار تربية للحيوانات الأليفة مستنيراً وأخلاقياً ومدعوماً من قبل مجتمع من الخبراء ملتزمين بإنتاج أجيال أصحة وأسعد من الحيوانات.',
      stats: [
        { number: '50K+', label: 'مستخدم نشط' },
        { number: '100K+', label: 'حيوان مسجل' },
        { number: '10K+', label: 'تطابقات ناجحة' },
        { number: '150+', label: 'دولة' },
      ],
      why: 'لماذا اختيار بيتمات؟',
      features: [
        {
          title: 'مطابقة مدعومة بالذكاء الاصطناعي',
          description:
            'خوارزميات متقدمة تحلل الجينات والصحة والسلوك للعثور على تطابقات مثالية',
          icon: Target,
        },
        {
          title: 'سجلات صحية شاملة',
          description:
            'توثيق صحي مفصل يشمل سجل التطعيم والفحوصات البيطرية',
          icon: Shield,
        },
        {
          title: 'مجتمع الخبراء',
          description: 'تواصل مع مربيين ذوي خبرة واحصل على نصائح احترافية',
          icon: Users,
        },
        {
          title: 'ملفات تعريفية مؤكدة',
          description:
            'جميع المربيين موثقون لضمان الثقة والمصداقية',
          icon: Award,
        },
        {
          title: 'شبكة عالمية',
          description:
            'تواصل مع المربيين والعشاق من حول العالم',
          icon: Globe,
        },
        {
          title: 'إخطارات فورية',
          description:
            'احصل على تحديثات فورية حول الحيوانات المطابقة والتحديثات المهمة',
          icon: Zap,
        },
      ],
      values: 'قيمنا الأساسية',
      valueList: [
        {
          title: 'الثقة والسلامة',
          description: 'نولي أولوية لسلامة ومصداقية جميع المستخدمين',
        },
        {
          title: 'التميز',
          description: 'نسعى لأعلى المعايير في ممارسات التربية',
        },
        {
          title: 'المجتمع',
          description: 'نعزز شبكة داعمة من عشاق الحيوانات المتحمسين',
        },
        {
          title: 'الابتكار',
          description:
            'نحسن باستمرار منصتنا بتقنية متطورة',
        },
      ],
      team: 'فريقنا',
      teamText:
        'تم تأسيس بيتمات من قبل فريق من عشاق الحيوانات الأليفة والأطباء البيطريين وخبراء التكنولوجيا الملتزمين بتحويل تربية الحيوانات الأليفة.',
      contact: 'تواصل معنا',
      contactText: 'هل لديك أسئلة؟ نود سماع منك.',
      email: 'support@petmate.com',
      phone: '+1 (555) 123-4567',
    },
  };

  const content = isArabic ? aboutContent.ar : aboutContent.en;

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 ${isArabic ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            {content.title}
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            {content.subtitle}
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {/* Mission */}
            <Card className="border-l-4 border-l-blue-600 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Target className="w-6 h-6 text-blue-600" />
                  {content.mission}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {content.missionText}
                </p>
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="border-l-4 border-l-indigo-600 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Zap className="w-6 h-6 text-indigo-600" />
                  {content.vision}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  {content.visionText}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {content.stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                <p className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            {content.why}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {content.features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <IconComponent className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">
            {content.values}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {content.valueList.map((value, index) => (
              <Card key={index} className="border-t-4 border-t-blue-600">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">
                        {value.title}
                      </h3>
                      <p className="text-gray-600">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {content.team}
          </h2>
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-8 pb-8">
              <p className="text-lg text-gray-600 leading-relaxed">
                {content.teamText}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            {content.contact}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {content.contactText}
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-8 mb-8">
            <div>
              <p className="text-sm opacity-75 mb-2">Email</p>
              <p className="text-2xl font-bold">{content.email}</p>
            </div>
            <div className="hidden md:block w-px bg-white opacity-30"></div>
            <div>
              <p className="text-sm opacity-75 mb-2">Phone</p>
              <p className="text-2xl font-bold">{content.phone}</p>
            </div>
          </div>
          <Button
            className="bg-white text-blue-600 hover:bg-gray-100 font-bold px-8 py-3"
          >
            {isArabic ? 'تواصل معنا' : 'Contact Us'}
          </Button>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">
            {isArabic ? 'انضم إلى مجتمع بيتمات اليوم' : 'Join the PetMate Community Today'}
          </h3>
          <p className="text-gray-300 mb-6">
            {isArabic
              ? 'ابدأ رحلتك نحو تطابقات الحيوانات المثالية'
              : 'Start your journey to perfect pet matches'}
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              {isArabic ? 'إنشاء حساب' : 'Create Account'}
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-gray-900">
              {isArabic ? 'اعرف المزيد' : 'Learn More'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
