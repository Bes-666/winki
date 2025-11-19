'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Link as LinkIcon, Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

interface Skill {
  id: string;
  name: string;
  level: number;
  experience: number;
  status: 'pending' | 'approved' | 'rejected';
  current_price?: number;
}

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDescription, setNewSkillDescription] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      // TODO: Получать user_id из контекста/сессии
      const userId = 'user-id-placeholder';

      const { data, error } = await supabase
        .from('skills')
        .select(`
          *,
          stocks (
            current_price
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading skills:', error);
        return;
      }

      if (data) {
        const formatted = data.map((skill: any) => ({
          id: skill.id,
          name: skill.name,
          level: skill.level,
          experience: skill.experience,
          status: skill.status,
          current_price: skill.stocks?.current_price || 0,
        }));
        setSkills(formatted);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) {
      return;
    }

    try {
      // TODO: Получать user_id из контекста/сессии
      const userId = 'user-id-placeholder';

      const { error } = await supabase
        .from('skills')
        .insert({
          user_id: userId,
          name: newSkillName,
          description: newSkillDescription,
          level: 1,
          experience: 0,
          status: 'pending',
        });

      if (error) {
        console.error('Error adding skill:', error);
        return;
      }

      setNewSkillName('');
      setNewSkillDescription('');
      setShowAddForm(false);
      loadSkills();
    } catch (error) {
      console.error('Error:', error);
    }
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
        <h1 className="text-3xl font-bold">My Skills</h1>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          variant="primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <h2 className="text-xl font-bold mb-4">Add New Skill</h2>
            <div className="space-y-4">
              <Input
                label="Skill Name"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                placeholder="e.g., Python, JavaScript, Design"
              />
              <Input
                label="Description (optional)"
                value={newSkillDescription}
                onChange={(e) => setNewSkillDescription(e.target.value)}
                placeholder="Brief description of your skill"
              />
              <div className="flex gap-2">
                <Button onClick={handleAddSkill} variant="primary">
                  Add Skill
                </Button>
                <Button onClick={() => setShowAddForm(false)} variant="ghost">
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : skills.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-dark-muted">
            <Award className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No skills yet</p>
            <p>Add your first skill to start tracking your progress!</p>
          </div>
        </Card>
      ) : (
        <Card>
          <h2 className="text-xl font-bold mb-4">Your Skills</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Skill</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Level</TableHead>
                <TableHead className="text-right">Experience</TableHead>
                <TableHead className="text-right">Stock Price</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((skill) => (
                <TableRow key={skill.id}>
                  <TableCell>
                    <div className="font-medium">{skill.name}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(skill.status)}</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {skill.level}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {skill.experience.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {skill.status === 'approved' && skill.current_price
                      ? formatCurrency(skill.current_price)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Upload className="w-4 h-4 mr-1" />
                        Upload Proof
                      </Button>
                      <Button size="sm" variant="ghost">
                        <LinkIcon className="w-4 h-4 mr-1" />
                        Add Link
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


