import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Upload, CheckCircle, Shield, FileText, Star } from 'lucide-react';

const SectionCard: React.FC<{ title: string; children: React.ReactNode }>= ({ title, children }) => (
  <Card className="shadow-1">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const ProfileVerificationPage: React.FC = () => {
  const [about, setAbout] = useState('');
  const [pets, setPets] = useState('');
  const [health, setHealth] = useState('');
  const [certs, setCerts] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const submitVerification = () => {
    setProgress(100);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <Card className="shadow-2">
        <CardContent className="flex items-center gap-4 py-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src="" />
            <AvatarFallback>PM</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">ملف المستخدم</h2>
              <Badge variant="default" className="bg-success text-white">غير مُحقق</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">قم بإكمال التحقق للحصول على شارات الثقة ومطابقات أفضل.</p>
          </div>
          <Button variant="secondary">
            <Shield className="w-4 h-4 mr-2" />
            ابدأ التحقق
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="about">
        <TabsList className="grid grid-cols-5 gap-2">
          <TabsTrigger value="about">نبذة</TabsTrigger>
          <TabsTrigger value="pets">الحيوانات</TabsTrigger>
          <TabsTrigger value="health">الصحة والجينات</TabsTrigger>
          <TabsTrigger value="certs">الشهادات</TabsTrigger>
          <TabsTrigger value="reviews">المراجعات</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4">
          <SectionCard title="نبذة">
            <Textarea placeholder="اكتب نبذة عن خبرتك واهتماماتك" value={about} onChange={(e) => setAbout(e.target.value)} />
            <div className="mt-3 text-right">
              <Button>حفظ</Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="pets" className="space-y-4">
          <SectionCard title="الحيوانات">
            <Textarea placeholder="أضف الحيوانات وخصائصها (السلالة، العمر، الصحة)" value={pets} onChange={(e) => setPets(e.target.value)} />
            <div className="mt-3 text-right">
              <Button>حفظ</Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <SectionCard title="الصحة والجينات">
            <Textarea placeholder="نتائج الفحوصات، التطعيمات، الاختبارات الجينية" value={health} onChange={(e) => setHealth(e.target.value)} />
            <div className="mt-3 text-right">
              <Button>حفظ</Button>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="certs" className="space-y-4">
          <SectionCard title="الشهادات">
            <div className="flex items-center gap-3">
              <Button variant="secondary"><Upload className="w-4 h-4 mr-2" />رفع شهادة</Button>
              {certs.length === 0 && (
                <span className="text-sm text-muted-foreground">أضف أول شهادة لك</span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {certs.map((c, idx) => (
                <Card key={idx}><CardContent className="py-4 flex items-center gap-2"><FileText className="w-4 h-4" />{c}</CardContent></Card>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <SectionCard title="المراجعات">
            <div className="text-sm text-muted-foreground">لا توجد مراجعات حتى الآن</div>
          </SectionCard>
        </TabsContent>
      </Tabs>

      <Card className="shadow-2">
        <CardHeader>
          <CardTitle>معالج التحقق</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="shadow-1"><CardContent className="py-4"><Shield className="w-4 h-4 mr-2 inline" />رفع الهوية</CardContent></Card>
            <Card className="shadow-1"><CardContent className="py-4"><FileText className="w-4 h-4 mr-2 inline" />الوثائق الصحية</CardContent></Card>
            <Card className="shadow-1"><CardContent className="py-4"><Star className="w-4 h-4 mr-2 inline" />المراجعات</CardContent></Card>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">التقدم الحالي: {progress}%</div>
            <Button onClick={submitVerification}><CheckCircle className="w-4 h-4 mr-2" />إرسال للمراجعة</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileVerificationPage;
