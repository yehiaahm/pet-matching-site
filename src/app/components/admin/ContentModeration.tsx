import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export function ContentModeration() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [page, setPage] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolutionAction, setResolutionAction] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    fetchReports();
  }, [page, statusFilter]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        status: statusFilter,
      });

      const response = await fetch(`/api/v1/admin/reports?${params}`);
      const data = await response.json();

      if (data.success) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveReport = async () => {
    try {
      const response = await fetch(`/api/v1/admin/reports/${selectedReport.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: resolutionAction,
          notes: resolutionNotes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Report resolved successfully');
        setSelectedReport(null);
        setResolutionAction('');
        setResolutionNotes('');
        fetchReports();
      } else {
        toast.error(data.message || 'Failed to resolve report');
      }
    } catch (error) {
      toast.error('Error resolving report');
    }
  };

  const getReasonColor = (reason) => {
    const colors = {
      INAPPROPRIATE_CONTENT: 'bg-red-100 text-red-800',
      HARASSMENT: 'bg-orange-100 text-orange-800',
      SPAM: 'bg-yellow-100 text-yellow-800',
      FRAUD: 'bg-red-100 text-red-800',
      SCAM: 'bg-red-100 text-red-800',
      DANGEROUS_BEHAVIOR: 'bg-red-100 text-red-800',
      ANIMAL_ABUSE: 'bg-red-100 text-red-800',
      FAKE_PROFILE: 'bg-purple-100 text-purple-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[reason] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Moderation</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Status Filter */}
        <div className="mb-6 flex gap-2">
          {['PENDING', 'REVIEWING', 'RESOLVED', 'REJECTED'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
            >
              {status}
            </Button>
          ))}
        </div>

        {/* Reports Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reporter</TableHead>
                <TableHead>Reported User</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    Loading reports...
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No reports found
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="text-sm">
                      {report.reporterUser?.email}
                    </TableCell>
                    <TableCell className="text-sm">
                      {report.reportedUser?.email || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getReasonColor(report.reason)}>
                        {report.reason.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.contentType}</Badge>
                    </TableCell>
                    <TableCell>
                      {report.status === 'PENDING' && (
                        <Badge className="bg-yellow-500">Pending</Badge>
                      )}
                      {report.status === 'REVIEWING' && (
                        <Badge className="bg-blue-500">Reviewing</Badge>
                      )}
                      {report.status === 'RESOLVED' && (
                        <Badge className="bg-green-500">Resolved</Badge>
                      )}
                      {report.status === 'REJECTED' && (
                        <Badge className="bg-gray-500">Rejected</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {report.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Review
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Resolution Dialog */}
        <Dialog open={!!selectedReport} onOpenChange={() => {
          setSelectedReport(null);
          setResolutionAction('');
          setResolutionNotes('');
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Report</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm">
                    <strong>Reason:</strong> {selectedReport.reason}
                  </p>
                  <p className="text-sm mt-2">
                    <strong>Description:</strong> {selectedReport.description}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Resolution Action
                  </label>
                  <Select value={resolutionAction} onValueChange={setResolutionAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DISMISS">Dismiss Report</SelectItem>
                      <SelectItem value="WARNING">Send Warning</SelectItem>
                      <SelectItem value="BAN_USER">Ban User</SelectItem>
                      <SelectItem value="DELETE_CONTENT">Delete Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium block mb-2">
                    Resolution Notes
                  </label>
                  <Textarea
                    placeholder="Explain your decision..."
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleResolveReport}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Resolve Report
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

export default ContentModeration;
