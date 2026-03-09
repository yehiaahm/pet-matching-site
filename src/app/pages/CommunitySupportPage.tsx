import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useLanguage } from '../context/LanguageContext';

interface CommunityGroup {
	key: string;
	title: string;
	titleAr: string;
	petTypes: string[];
	membershipMode: 'AUTO';
	membersCount: number;
}

interface GroupMember {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	avatar?: string | null;
	isVerified: boolean;
	role: string;
}

export default function CommunitySupportPage() {
	const navigate = useNavigate();
	const { language } = useLanguage();
	const [groups, setGroups] = useState<CommunityGroup[]>([]);
	const [loading, setLoading] = useState(true);
	const [membersByGroup, setMembersByGroup] = useState<Record<string, GroupMember[]>>({});
	const [loadingMembersGroup, setLoadingMembersGroup] = useState<string | null>(null);
	const [expandedGroupKey, setExpandedGroupKey] = useState<string | null>(null);

	useEffect(() => {
		const fetchGroups = async () => {
			try {
				const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
				const response = await fetch('/api/v1/community/groups', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error('Failed to load groups');
				}

				const result = await response.json();
				setGroups(result?.data || []);
			} catch (error) {
				console.error(error);
				setGroups([]);
			} finally {
				setLoading(false);
			}
		};

		fetchGroups();
	}, []);

	const handleViewMembers = async (groupKey: string) => {
		if (expandedGroupKey === groupKey) {
			setExpandedGroupKey(null);
			return;
		}

		setExpandedGroupKey(groupKey);

		if (membersByGroup[groupKey]) {
			return;
		}

		try {
			setLoadingMembersGroup(groupKey);
			const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
			const response = await fetch(`/api/v1/community/groups/${groupKey}/members`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error('Failed to load group members');
			}

			const result = await response.json();
			setMembersByGroup((prev) => ({
				...prev,
				[groupKey]: result?.data?.members || [],
			}));
		} catch (error) {
			console.error(error);
			setMembersByGroup((prev) => ({
				...prev,
				[groupKey]: [],
			}));
		} finally {
			setLoadingMembersGroup(null);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<div className="max-w-5xl mx-auto space-y-6">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						<Users className="w-7 h-7 text-teal-600" />
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								{language === 'ar' ? 'جروبات المجتمع' : 'Community Groups'}
							</h1>
							<p className="text-sm text-gray-600">
								{language === 'ar'
									? 'يتم إضافتك تلقائيًا حسب نوع الحيوان الذي تمتلكه'
									: 'You are automatically added based on your pet type'}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2">
							<ArrowLeft className="w-4 h-4" />
							{language === 'ar' ? 'رجوع' : 'Back'}
						</Button>
						<Button onClick={() => navigate('/community-support/chat')} className="gap-2">
							<MessageCircle className="w-4 h-4" />
							{language === 'ar' ? 'فتح المحادثات' : 'Open Chats'}
						</Button>
					</div>
				</div>

				{loading ? (
					<Card>
						<CardContent className="py-8 text-center text-gray-500">
							{language === 'ar' ? 'جاري تحميل الجروبات...' : 'Loading groups...'}
						</CardContent>
					</Card>
				) : groups.length === 0 ? (
					<Card>
						<CardContent className="py-8 text-center text-gray-500">
							{language === 'ar' ? 'لا توجد جروبات متاحة حاليًا' : 'No groups available right now'}
						</CardContent>
					</Card>
				) : (
					<div className="grid md:grid-cols-2 gap-4">
						{groups.map((group) => (
							<Card key={group.key}>
								<CardHeader>
									<div className="flex items-center justify-between gap-2">
										<CardTitle>{language === 'ar' ? group.titleAr : group.title}</CardTitle>
										<Badge variant="secondary">AUTO</Badge>
									</div>
									<CardDescription>
										{language === 'ar'
											? `الأنواع: ${group.petTypes.join(' / ')}`
											: `Types: ${group.petTypes.join(' / ')}`}
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-sm text-gray-600">
											{language === 'ar' ? 'عدد الأعضاء' : 'Members'}: {group.membersCount}
										</span>
										<div className="flex items-center gap-2">
											<Button variant="outline" size="sm" onClick={() => handleViewMembers(group.key)}>
												{expandedGroupKey === group.key
													? language === 'ar'
														? 'إخفاء الأعضاء'
														: 'Hide Members'
													: language === 'ar'
														? 'عرض الأعضاء'
														: 'View Members'}
											</Button>
											<Button size="sm" onClick={() => navigate('/community-support/chat')}>
												{language === 'ar' ? 'دخول الشات' : 'Enter Chat'}
											</Button>
										</div>
									</div>

									{expandedGroupKey === group.key && (
										<div className="rounded-lg border bg-gray-50 p-3 space-y-2">
											{loadingMembersGroup === group.key ? (
												<p className="text-xs text-gray-500">
													{language === 'ar' ? 'جاري تحميل الأعضاء...' : 'Loading members...'}
												</p>
											) : (membersByGroup[group.key] || []).length === 0 ? (
												<p className="text-xs text-gray-500">
													{language === 'ar' ? 'لا يوجد أعضاء لعرضهم' : 'No members to display'}
												</p>
											) : (
												(membersByGroup[group.key] || []).slice(0, 8).map((member) => (
													<div key={member.id} className="flex items-center justify-between gap-2 text-xs">
														<span className="font-medium text-gray-700 truncate">
															{member.firstName} {member.lastName}
														</span>
														<span className="text-gray-500 truncate">{member.email}</span>
													</div>
												))
											)}
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

