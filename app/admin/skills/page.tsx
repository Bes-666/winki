'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  description?: string;
  level: number;
  experience: number;
  status: 'pending' | 'approved' | 'rejected';
  user: {
    username?: string;
    first_name?: string;
  };
  created_at: string;
}

export default function AdminSkillsPage() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';
  
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  useEffect(() => {
    loadSkills();
  }, [statusFilter]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('skills')
        .select(`
          *,
          users!skills_user_id_fkey (
            username,
            first_name
          )
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading skills:', error);
        return;
      }

      if (data) {
        setSkills(data.map((skill: any) => ({
          id: skill.id,
          name: skill.name,
          description: skill.description,
          level: skill.level,
          experience: skill.experience,
          status: skill.status,
          user: skill.users || {},
          created_at: skill.created_at,
        })));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (skillId: string) => {
    const { error } = await supabase
      .from('skills')
      .update({ status: 'approved' })
      .eq('id', skillId);

    if (error) {
      console.error('Error approving skill:', error);
      return;
    }

    loadSkills();
  };

  const handleReject = async (skillId: string) => {
    const { error } = await supabase
      .from('skills')
      .update({ status: 'rejected' })
      .eq('id', skillId);

    if (error) {
      console.error('Error rejecting skill:', error);
      return;
    }

    loadSkills();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Skills Moderation</h1>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'primary' : 'ghost'}
            onClick={() => window.location.href = '/admin/skills'}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'primary' : 'ghost'}
            onClick={() => window.location.href = '/admin/skills?status=pending'}
          >
            Pending
          </Button>
          <Button
            variant={statusFilter === 'approved' ? 'primary' : 'ghost'}
            onClick={() => window.location.href = '/admin/skills?status=approved'}
          >
            Approved
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Level</TableHead>
                <TableHead className="text-right">Experience</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell>
                    <div className="font-medium">{skill.name}</div>
                    {skill.description && (
                      <div className="text-sm text-dark-muted">{skill.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>@{skill.user.username || skill.user.first_name || 'Unknown'}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(skill.status)}</TableCell>
                  <TableCell className="text-right font-mono">{skill.level}</TableCell>
                  <TableCell className="text-right font-mono">{skill.experience.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {skill.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleApprove(skill.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleReject(skill.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedSkill(skill)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}


