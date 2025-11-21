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
import { useUser } from '@/contexts/UserContext';

interface Skill {
  id: string;
  name: string;
  level: number;
  experience: number;
  status: 'pending' | 'approved' | 'rejected';
  current_price?: number;
}

export default function SkillsPage() {
  const { user, loading: userLoading } = useUser();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDescription, setNewSkillDescription] = useState('');
  const [selectedSkillForProof, setSelectedSkillForProof] = useState<string | null>(null);
  const [proofType, setProofType] = useState<'photo' | 'link' | null>(null);
  const [proofUrl, setProofUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadSkills();
    }
  }, [user]);

  const loadSkills = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userId = user.id;

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
    if (!newSkillName.trim() || !user) {
      return;
    }

    try {
      const userId = user.id;

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
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setSelectedSkillForProof(skill.id);
                          setProofType('photo');
                          setProofUrl('');
                        }}
                      >
                        <Upload className="w-4 h-4 mr-1" />
                        Upload Proof
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setSelectedSkillForProof(skill.id);
                          setProofType('link');
                          setProofUrl('');
                        }}
                      >
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

      {/* Модальное окно для загрузки доказательств */}
      {selectedSkillForProof && proofType && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedSkillForProof(null);
            setProofType(null);
            setProofUrl('');
          }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-dark-card rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold mb-4">
              {proofType === 'photo' ? 'Upload Proof Photo' : 'Add Proof Link'}
            </h3>
            
            {proofType === 'photo' ? (
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    setUploading(true);
                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `${selectedSkillForProof}-${Date.now()}.${fileExt}`;
                      const filePath = `proofs/${fileName}`;

                      const { error: uploadError } = await supabase.storage
                        .from('proofs')
                        .upload(filePath, file);

                      if (uploadError) {
                        console.error('Upload error:', uploadError);
                        alert('Failed to upload file. Please make sure storage bucket is set up.');
                        return;
                      }

                      const { data } = supabase.storage
                        .from('proofs')
                        .getPublicUrl(filePath);

                      setProofUrl(data.publicUrl);
                    } catch (error) {
                      console.error('Error:', error);
                      alert('Failed to upload file');
                    } finally {
                      setUploading(false);
                    }
                  }}
                  className="block w-full text-sm text-dark-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600"
                />
                {proofUrl && (
                  <div className="p-2 bg-success/10 border border-success/20 rounded text-sm text-success">
                    File uploaded successfully!
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Input
                  type="url"
                  label="Proof Link"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://example.com/proof"
                />
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <Button
                variant="primary"
                className="flex-1"
                onClick={async () => {
                  if (!proofUrl || !selectedSkillForProof) return;

                  try {
                    setUploading(true);
                    const { error } = await supabase
                      .from('achievements')
                      .insert({
                        skill_id: selectedSkillForProof,
                        proof_type: proofType,
                        proof_url: proofUrl,
                        experience_awarded: 0,
                        status: 'pending',
                      });

                    if (error) {
                      console.error('Error creating achievement:', error);
                      alert('Failed to submit proof');
                      return;
                    }

                    setSelectedSkillForProof(null);
                    setProofType(null);
                    setProofUrl('');
                    alert('Proof submitted successfully! It will be reviewed by moderators.');
                  } catch (error) {
                    console.error('Error:', error);
                    alert('Failed to submit proof');
                  } finally {
                    setUploading(false);
                  }
                }}
                disabled={!proofUrl || uploading}
                isLoading={uploading}
              >
                Submit
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedSkillForProof(null);
                  setProofType(null);
                  setProofUrl('');
                }}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}


