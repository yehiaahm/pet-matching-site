import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Bot, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap, 
  Settings, 
  Activity,
  Database,
  Shield,
  Code,
  FileText,
  TrendingUp,
  Users,
  Server,
  Wifi,
  WifiOff,
  RefreshCw,
  Play,
  Pause,
  Square
} from 'lucide-react';

interface AIAssistant {
  id: string;
  name: string;
  type: 'diagnostic' | 'repair' | 'monitoring' | 'security';
  status: 'active' | 'idle' | 'busy' | 'offline';
  performance: number;
  tasksCompleted: number;
  lastActivity: string;
  capabilities: string[];
}

interface SystemIssue {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  component: string;
  detectedAt: string;
  status: 'detected' | 'diagnosing' | 'repairing' | 'resolved';
  aiAssigned?: string;
  estimatedFixTime?: string;
}

interface AICommand {
  id: string;
  command: string;
  description: string;
  category: 'diagnostic' | 'repair' | 'optimization' | 'security';
  riskLevel: 'low' | 'medium' | 'high';
  autoExecute: boolean;
}

export function PetMatAIControlPanel() {
  const [aiAssistants, setAiAssistants] = useState<AIAssistant[]>([
    {
      id: 'ai-diagnostic-1',
      name: 'PetMat Diagnostic AI',
      type: 'diagnostic',
      status: 'active',
      performance: 95,
      tasksCompleted: 1247,
      lastActivity: '2 دقائق مضت',
      capabilities: ['تشخيص الأخطاء', 'تحليل السجلات', 'اكتشاف المشاكل', 'تقارير الحالة']
    },
    {
      id: 'ai-repair-1',
      name: 'PetMat Repair AI',
      type: 'repair',
      status: 'active',
      performance: 88,
      tasksCompleted: 892,
      lastActivity: '5 دقائق مضت',
      capabilities: ['إصلاح الأعطال', 'استعادة البيانات', 'تحديث المكونات', 'إعادة التشغيل']
    },
    {
      id: 'ai-monitor-1',
      name: 'PetMat Monitor AI',
      type: 'monitoring',
      status: 'active',
      performance: 92,
      tasksCompleted: 2156,
      lastActivity: 'الآن',
      capabilities: ['مراقبة الأداء', 'تنبيهات فورية', 'تحليل الاتجاهات', 'تقارير مباشرة']
    },
    {
      id: 'ai-security-1',
      name: 'PetMat Security AI',
      type: 'security',
      status: 'idle',
      performance: 98,
      tasksCompleted: 445,
      lastActivity: '15 دقيقة مضت',
      capabilities: ['حماية البيانات', 'كشف التسلل', 'فحص الثغرات', 'نسخ احتياطي']
    }
  ]);

  const [systemIssues, setSystemIssues] = useState<SystemIssue[]>([
    {
      id: 'issue-1',
      type: 'critical',
      title: 'انقطاع اتصال قاعدة البيانات',
      description: 'فقدان الاتصال بقاعدة البيانات الرئيسية',
      component: 'PostgreSQL',
      detectedAt: '5 دقائق مضت',
      status: 'repairing',
      aiAssigned: 'PetMat Repair AI',
      estimatedFixTime: '2-3 دقائق'
    },
    {
      id: 'issue-2',
      type: 'warning',
      title: 'ارتفاع استهلاك الذاكرة',
      description: 'استهلاك الذاكرة يتجاوز 85%',
      component: 'Frontend',
      detectedAt: '10 دقائق مضت',
      status: 'diagnosing',
      aiAssigned: 'PetMat Diagnostic AI',
      estimatedFixTime: '1-2 دقائق'
    }
  ]);

  const [customCommand, setCustomCommand] = useState('');
  const [selectedAI, setSelectedAI] = useState('');
  const [autoRepair, setAutoRepair] = useState(true);
  const [monitoringEnabled, setMonitoringEnabled] = useState(true);
  const [securityMode, setSecurityMode] = useState('balanced');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [selectedAssistantForSettings, setSelectedAssistantForSettings] = useState<AIAssistant | null>(null);

  const addNotification = (message: string) => {
    setNotifications(prev => [message, ...prev.slice(0, 4)]); // Keep only last 5 notifications
  };

  const aiCommands: AICommand[] = [
    {
      id: 'cmd-1',
      command: 'diagnose:full-system',
      description: 'فحص شامل للنظام',
      category: 'diagnostic',
      riskLevel: 'low',
      autoExecute: true
    },
    {
      id: 'cmd-2',
      command: 'repair:database-connection',
      description: 'إصلاح اتصال قاعدة البيانات',
      category: 'repair',
      riskLevel: 'medium',
      autoExecute: false
    },
    {
      id: 'cmd-3',
      command: 'optimize:frontend-performance',
      description: 'تحسين أداء الواجهة الأمامية',
      category: 'optimization',
      riskLevel: 'low',
      autoExecute: true
    },
    {
      id: 'cmd-4',
      command: 'security:scan-vulnerabilities',
      description: 'فحص الثغرات الأمنية',
      category: 'security',
      riskLevel: 'medium',
      autoExecute: false
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'busy': return 'bg-orange-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  // Button handlers
  const handleAssistantSettings = (assistantId: string) => {
    const assistant = aiAssistants.find(ai => ai.id === assistantId);
    if (assistant) {
      setSelectedAssistantForSettings(assistant);
      setSettingsDialogOpen(true);
    }
  };

  const handleAssistantControl = (assistantId: string) => {
    const assistant = aiAssistants.find(ai => ai.id === assistantId);
    addNotification(`تم التحكم في ${assistant?.name}`);
    console.log('Controlling assistant:', assistantId);
  };

  const handleIssueRefresh = (issueId: string) => {
    const issue = systemIssues.find(iss => iss.id === issueId);
    addNotification(`تم تحديث حالة المشكلة: ${issue?.title}`);
    console.log('Refreshing issue:', issueId);
  };

  const handleRestartSystem = () => {
    addNotification('جاري إعادة تشغيل النظام...');
    console.log('Restarting system');
    setTimeout(() => {
      addNotification('تم إعادة تشغيل النظام بنجاح');
    }, 2000);
  };

  const handleDatabaseCheck = () => {
    addNotification('جاري فحص قاعدة البيانات...');
    console.log('Checking database');
    setTimeout(() => {
      addNotification('تم فحص قاعدة البيانات - لم يتم العثور على مشاكل');
    }, 1500);
  };

  const handleSecurityCheck = () => {
    addNotification('جاري إجراء فحص أمني شامل...');
    console.log('Running security check');
    setTimeout(() => {
      addNotification('تم إكمال الفحص الأمني - النظام آمن');
    }, 3000);
  };

  const handleExecuteCommand = (command: AICommand) => {
    addNotification(`جاري تنفيذ الأمر: ${command.command}`);
    console.log('Executing command:', command.command);
    setTimeout(() => {
      addNotification(`تم تنفيذ الأمر ${command.command} بنجاح`);
    }, 1000);
  };

  const handleExecuteCustomCommand = () => {
    if (!customCommand.trim()) {
      addNotification('يرجى إدخال أمر مخصص');
      return;
    }
    if (!selectedAI) {
      addNotification('يرجى اختيار مساعد ذكي');
      return;
    }
    const assistant = aiAssistants.find(ai => ai.id === selectedAI);
    addNotification(`جاري تنفيذ الأمر المخصص بواسطة ${assistant?.name}`);
    console.log('Executing custom command:', customCommand, 'with AI:', selectedAI);
    setTimeout(() => {
      addNotification('تم تنفيذ الأمر المخصص بنجاح');
      setCustomCommand('');
      setSelectedAI('');
    }, 2000);
  };

  const handleToggleAutoRepair = () => {
    setAutoRepair(!autoRepair);
    addNotification(`الإصلاح التلقائي ${!autoRepair ? 'مفعل' : 'معطل'}`);
  };

  const handleToggleMonitoring = () => {
    setMonitoringEnabled(!monitoringEnabled);
    addNotification(`المراقبة المستمرة ${!monitoringEnabled ? 'مفعلة' : 'معطلة'}`);
  };

  const handleSaveAssistantSettings = () => {
    if (selectedAssistantForSettings) {
      addNotification(`تم حفظ إعدادات ${selectedAssistantForSettings.name}`);
      setSettingsDialogOpen(false);
      setSelectedAssistantForSettings(null);
    }
  };

  const handleOptimizePerformance = () => {
    addNotification('جاري تحسين الأداء...');
    console.log('Optimizing performance');
    setTimeout(() => {
      addNotification('تم تحسين الأداء بنجاح - تحسن بنسبة 15%');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Bot className="w-8 h-8" />
                PetMat AI Control Panel
              </h1>
              <p className="mt-2 text-blue-100">نظام الذكاء الاصطناعي المتقدم للصيانة والدعم الفني</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{aiAssistants.filter(ai => ai.status === 'active').length}</div>
                <div className="text-sm text-blue-100">AI نشط</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{systemIssues.filter(issue => issue.status === 'resolved').length}</div>
                <div className="text-sm text-blue-100">مشكلة محلولة</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold text-blue-700">الإشعارات الأخيرة</h3>
            </div>
            <div className="space-y-1">
              {notifications.map((notification, index) => (
                <div key={index} className="text-sm text-gray-600">
                  • {notification}
                </div>
              ))}
            </div>
          </div>
        )}

        <Tabs defaultValue="assistants" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assistants">المساعدون الذكيون</TabsTrigger>
            <TabsTrigger value="issues">المشاكل الحالية</TabsTrigger>
            <TabsTrigger value="commands">الأوامر الذكية</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          {/* AI Assistants Tab */}
          <TabsContent value="assistants" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {aiAssistants.map((assistant) => (
                <Card key={assistant.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{assistant.name}</CardTitle>
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(assistant.status)}`} />
                    </div>
                    <CardDescription>
                      {assistant.type === 'diagnostic' && 'تشخيص'}
                      {assistant.type === 'repair' && 'إصلاح'}
                      {assistant.type === 'monitoring' && 'مراقبة'}
                      {assistant.type === 'security' && 'أمان'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>الأداء</span>
                        <span>{assistant.performance}%</span>
                      </div>
                      <Progress value={assistant.performance} className="h-2" />
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>المهام المكتملة:</span>
                        <span>{assistant.tasksCompleted}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>آخر نشاط:</span>
                        <span>{assistant.lastActivity}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">القدرات:</div>
                      <div className="flex flex-wrap gap-1">
                        {assistant.capabilities.slice(0, 3).map((capability, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {capability}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => handleAssistantSettings(assistant.id)}>
                        <Settings className="w-4 h-4 ml-2" />
                        إعدادات
                      </Button>
                      <Button size="sm" className="flex-1" onClick={() => handleAssistantControl(assistant.id)}>
                        <Activity className="w-4 h-4 ml-2" />
                        تحكم
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-xl font-semibold">المشاكل الحالية</h3>
                {systemIssues.map((issue) => (
                  <Card key={issue.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-3 h-3 rounded-full ${getIssueTypeColor(issue.type)}`} />
                            <h4 className="font-semibold">{issue.title}</h4>
                            <Badge variant="outline">{issue.component}</Badge>
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{issue.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {issue.detectedAt}
                            </span>
                            {issue.aiAssigned && (
                              <span className="flex items-center gap-1">
                                <Bot className="w-4 h-4" />
                                {issue.aiAssigned}
                              </span>
                            )}
                            {issue.estimatedFixTime && (
                              <span className="flex items-center gap-1">
                                <Zap className="w-4 h-4" />
                                {issue.estimatedFixTime}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge 
                            variant={issue.status === 'resolved' ? 'default' : 'secondary'}
                            className="min-w-[100px] text-center"
                          >
                            {issue.status === 'detected' && 'تم اكتشافه'}
                            {issue.status === 'diagnosing' && 'جاري التشخيص'}
                            {issue.status === 'repairing' && 'جاري الإصلاح'}
                            {issue.status === 'resolved' && 'تم الحل'}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => handleIssueRefresh(issue.id)}>
                            <RefreshCw className="w-4 h-4 ml-2" />
                            تحديث
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">إحصائيات سريعة</h3>
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        حرج
                      </span>
                      <span className="font-bold text-red-600">
                        {systemIssues.filter(issue => issue.type === 'critical').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        تحذير
                      </span>
                      <span className="font-bold text-yellow-600">
                        {systemIssues.filter(issue => issue.type === 'warning').length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        محلول
                      </span>
                      <span className="font-bold text-green-600">
                        {systemIssues.filter(issue => issue.status === 'resolved').length}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">الإجراءات السريعة</h4>
                    <div className="space-y-2">
                      <Button className="w-full" variant="outline" onClick={handleRestartSystem}>
                        <RefreshCw className="w-4 h-4 ml-2" />
                        إعادة تشغيل النظام
                      </Button>
                      <Button className="w-full" variant="outline" onClick={handleDatabaseCheck}>
                        <Database className="w-4 h-4 ml-2" />
                        فحص قاعدة البيانات
                      </Button>
                      <Button className="w-full" variant="outline" onClick={handleSecurityCheck}>
                        <Shield className="w-4 h-4 ml-2" />
                        فحص أمني شامل
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Commands Tab */}
          <TabsContent value="commands" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">الأوامر الذكية المحددة مسبقاً</h3>
                <div className="space-y-3">
                  {aiCommands.map((command) => (
                    <Card key={command.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Code className="w-4 h-4" />
                              <h4 className="font-mono text-sm">{command.command}</h4>
                              <Badge className={getRiskLevelColor(command.riskLevel)}>
                                {command.riskLevel === 'high' && 'عالي'}
                                {command.riskLevel === 'medium' && 'متوسط'}
                                {command.riskLevel === 'low' && 'منخفض'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{command.description}</p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {command.autoExecute && (
                              <Badge variant="secondary" className="text-xs">
                                تلقائي
                              </Badge>
                            )}
                            <Button 
                              size="sm" 
                              onClick={() => handleExecuteCommand(command)}
                              disabled={command.riskLevel === 'high'}
                            >
                              <Play className="w-4 h-4 ml-2" />
                              تنفيذ
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">أمر مخصص</h3>
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div>
                      <Label htmlFor="custom-command">الأمر المخصص</Label>
                      <Input
                        id="custom-command"
                        placeholder="أدخل الأمر المخصص..."
                        value={customCommand}
                        onChange={(e) => setCustomCommand(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ai-select">اختر المساعد الذكي</Label>
                      <Select value={selectedAI} onValueChange={setSelectedAI}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المساعد الذكي" />
                        </SelectTrigger>
                        <SelectContent>
                          {aiAssistants.map((assistant) => (
                            <SelectItem key={assistant.id} value={assistant.id}>
                              {assistant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="command-description">وصف الأمر</Label>
                      <Textarea
                        id="command-description"
                        placeholder="صف ما يجب على القيام به..."
                        rows={3}
                      />
                    </div>
                    <Button className="w-full" onClick={handleExecuteCustomCommand}>
                      <Bot className="w-4 h-4 ml-2" />
                      تنفيذ الأمر المخصص
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>الإعدادات العامة</CardTitle>
                  <CardDescription>تحكم في سلوك نظام AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>الإصلاح التلقائي</Label>
                      <p className="text-sm text-gray-600">السماح للـ AI بإصلاح المشاكل تلقائياً</p>
                    </div>
                    <Button
                      variant={autoRepair ? "default" : "outline"}
                      size="sm"
                      onClick={handleToggleAutoRepair}
                    >
                      {autoRepair ? 'مفعل' : 'معطل'}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>المراقبة المستمرة</Label>
                      <p className="text-sm text-gray-600">مراقبة النظام على مدار الساعة</p>
                    </div>
                    <Button
                      variant={monitoringEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={handleToggleMonitoring}
                    >
                      {monitoringEnabled ? 'مفعل' : 'معطل'}
                    </Button>
                  </div>
                  <div>
                    <Label>وضع الأمان</Label>
                    <Select value={securityMode} onValueChange={setSecurityMode}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">منخفض</SelectItem>
                        <SelectItem value="balanced">متوازن</SelectItem>
                        <SelectItem value="high">عالي</SelectItem>
                        <SelectItem value="paranoid">شديد الحذر</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إعدادات الأداء</CardTitle>
                  <CardDescription>تحسين أداء نظام AI</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>مستوى الأداء المطلوب</Label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>الحالي</span>
                        <span>91%</span>
                      </div>
                      <Progress value={91} className="h-2" />
                    </div>
                  </div>
                  <div>
                    <Label>استهلاك الموارد</Label>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>المعالج</span>
                        <span>45%</span>
                      </div>
                      <Progress value={45} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>الذاكرة</span>
                        <span>67%</span>
                      </div>
                      <Progress value={67} className="h-2" />
                    </div>
                  </div>
                  <Button className="w-full" onClick={handleOptimizePerformance}>
                    <TrendingUp className="w-4 h-4 ml-2" />
                    تحسين الأداء
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              إعدادات {selectedAssistantForSettings?.name}
            </DialogTitle>
            <DialogDescription>
              تخصيص إعدادات المساعد الذكي
            </DialogDescription>
          </DialogHeader>

          {selectedAssistantForSettings && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>مستوى الأولوية</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">منخفض</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="high">عالي</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>وضع العمل</Label>
                <Select defaultValue="auto">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">تلقائي</SelectItem>
                    <SelectItem value="manual">يدوي</SelectItem>
                    <SelectItem value="scheduled">مجدول</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>القدرات المفعلة</Label>
                <div className="space-y-2">
                  {selectedAssistantForSettings.capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`capability-${index}`}
                        defaultChecked={true}
                        className="rounded"
                      />
                      <Label htmlFor={`capability-${index}`} className="text-sm">
                        {capability}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveAssistantSettings} className="flex-1">
                  حفظ الإعدادات
                </Button>
                <Button variant="outline" onClick={() => setSettingsDialogOpen(false)} className="flex-1">
                  إلغاء
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
