import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Student {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  passedout_year: string;
  college: string;
  state: string;
  city: string;
  created: string | null;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  window_start: string;
  window_end: string;
  duration_minutes: number;
  subjects?: string[];
  category?: string;
}

interface Breakdown {
  subject: string;
  correct: number;
  total: number;
  percent: number;
}

interface Result {
  attemptId: number;
  studentId: number;
  studentName: string;
  examId: string;
  score: number;
  total: number;
  percentage: number;
  startedAt: string;
  submittedAt: string;
  breakdown: Breakdown[];
}

interface ExamResultsResponse {
  exam_id: number;
  attempts: {
    attempt_id: number;
    user_id: number;
    score: number;
    total: number;
    percent: number;
    started_at: string;
    submitted_at: string;
    breakdown: Breakdown[];
  }[];
}

interface College {
  id: number;
  name: string;
  passkey: string;
  passkey_expires_at: string;
  is_active?: boolean;
}

interface ContactStudent {
  id: number;
  name: string;
  qualification: string;
  passedout_year: string;
  college: string;
  purpose: string;
  phone: string;
  email: string;
}

interface ContactCollege {
  id: number;
  name: string;
  location: string;
  contact: string;
  email: string;
  designation: string;
  point_of_contact: string;
}

interface ContactRecruiter {
  id: number;
  company_name: string;
  designation: string;
  point_of_contact_name: string;
  phone: string;
  email: string;
  using_platform: string;
}

const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number>(1);
  const [isCollegeDialogOpen, setIsCollegeDialogOpen] = useState(false);
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isIndividualDialogOpen, setIsIndividualDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [collegeData, setCollegeData] = useState({ 
    name: "", 
    passkey: "", 
    passkey_expires_at: "" 
  });
  const [examData, setExamData] = useState({
    title: "",
    description: "",
    window_start: "",
    window_end: "",
    duration_minutes: 30,
    subjects: [] as string[],
    category: ""
  });
  const [bulkExamId, setBulkExamId] = useState<string>('');
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [individualExamId, setIndividualExamId] = useState<string>('');
  const [questionText, setQuestionText] = useState<string>('');
  const [individualOptions, setIndividualOptions] = useState<string[]>(['']);
  const [selectedCorrectIndex, setSelectedCorrectIndex] = useState<string>('0');
  const [subjectName, setSubjectName] = useState<string>('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [isBreakdownDialogOpen, setIsBreakdownDialogOpen] = useState(false);
  const [contactStudents, setContactStudents] = useState<ContactStudent[]>([]);
  const [contactColleges, setContactColleges] = useState<ContactCollege[]>([]);
  const [contactRecruiters, setContactRecruiters] = useState<ContactRecruiter[]>([]);

  useEffect(() => {
    fetchExams();
    fetchStudents();
    fetchColleges();
    fetchContactStudents();
    fetchContactColleges();
    fetchContactRecruiters();
  }, []);

  useEffect(() => {
    if (exams.length > 0 && !selectedExamId) {
      setSelectedExamId(exams[0].id);
    }
  }, [exams, selectedExamId]);

  useEffect(() => {
    if (selectedExamId) {
      fetchResults(selectedExamId);
    }
  }, [selectedExamId]);

  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://52.87.175.51:8000/exam/exams", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setExams(data);
      } else {
        toast.error("Failed to fetch exams");
      }
    } catch (error) {
      toast.error("Network error fetching exams");
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://52.87.175.51:8000/admin/registrations", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      toast.error("Network error fetching students");
    }
  };

  const fetchColleges = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://52.87.175.51:8000/admin/colleges", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setColleges(data);
      } else {
        toast.error("Failed to fetch colleges");
      }
    } catch (error) {
      toast.error("Network error fetching colleges");
    }
  };

  const fetchContactStudents = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://52.87.175.51:8000/contact/admin/students?limit=100&offset=0", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setContactStudents(Array.isArray(data) ? data : []);
      } else {
        toast.error("Failed to fetch contact students");
      }
    } catch (error) {
      toast.error("Network error fetching contact students");
    }
  };

  const fetchContactColleges = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://52.87.175.51:8000/contact/admin/colleges?limit=100&offset=0", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setContactColleges(Array.isArray(data) ? data : []);
      } else {
        toast.error("Failed to fetch contact colleges");
      }
    } catch (error) {
      toast.error("Network error fetching contact colleges");
    }
  };

  const fetchContactRecruiters = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch("http://52.87.175.51:8000/contact/admin/recruiters?limit=100&offset=0", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setContactRecruiters(Array.isArray(data) ? data : []);
      } else {
        toast.error("Failed to fetch contact recruiters");
      }
    } catch (error) {
      toast.error("Network error fetching contact recruiters");
    }
  };

  const fetchResults = async (examId: string) => {
    if (!examId) {
      setResults([]);
      return;
    }
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`http://52.87.175.51:8000/admin/exams/${examId}/results`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const responseData: ExamResultsResponse = await response.json();
        console.log('Fetched results data:', responseData); // Debug log
        const processedResults: Result[] = responseData.attempts.map(attempt => {
          const student = students.find(s => s.user_id === attempt.user_id);
          console.log('Processing attempt for user:', attempt.user_id, 'Student found:', student); // Debug log
          return {
            attemptId: attempt.attempt_id,
            studentId: attempt.user_id,
            studentName: student ? student.name : `User ${attempt.user_id}`,
            examId: examId,
            score: attempt.score,
            total: attempt.total,
            percentage: attempt.percent,
            startedAt: attempt.started_at,
            submittedAt: attempt.submitted_at,
            breakdown: attempt.breakdown,
          };
        });
        console.log('Processed results:', processedResults); // Debug log
        setResults(processedResults);
      } else {
        console.error('Fetch results failed:', response.status, response.statusText); // Debug log
        toast.error("Failed to fetch results");
        setResults([]);
      }
    } catch (error) {
      console.error('Network error fetching results:', error); // Debug log
      toast.error("Network error fetching results");
      setResults([]);
    }
  };

  const handleCreateExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (examData.title && examData.window_start && examData.window_end && examData.duration_minutes && examData.subjects.length > 0 && examData.category) {
      try {
        const subjects = examData.subjects.map(s => s.trim()).filter(s => s);
        if (subjects.length === 0) {
          toast.error("Please add at least one subject!");
          return;
        }
        const token = localStorage.getItem("adminToken");
        const response = await fetch("http://52.87.175.51:8000/admin/exams", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: examData.title,
            description: examData.description,
            window_start: new Date(examData.window_start).toISOString(),
            window_end: new Date(examData.window_end).toISOString(),
            duration_minutes: parseInt(examData.duration_minutes.toString()),
            subjects: subjects,
            category: examData.category,
          }),
        });

        if (response.ok) {
          toast.success("Exam created successfully!");
          setIsCreateExamOpen(false);
          setExamData({
            title: "",
            description: "",
            window_start: "",
            window_end: "",
            duration_minutes: 30,
            subjects: [],
            category: ""
          });
          fetchExams();
        } else {
          toast.error("Failed to create exam. Please try again.");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      }
    } else {
      toast.error("Please fill all fields and add at least one subject!");
    }
  };

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkExamId && bulkFile) {
      try {
        const token = localStorage.getItem("adminToken");
        const formData = new FormData();
        formData.append('file', bulkFile);
        const response = await fetch(`http://52.87.175.51:8000/admin/exams/${bulkExamId}/questions/bulk?skip_invalid=false`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          toast.success("Bulk questions uploaded successfully!");
          setIsBulkDialogOpen(false);
          setBulkExamId('');
          setBulkFile(null);
        } else {
          toast.error("Failed to upload bulk questions. Please try again.");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      }
    } else {
      toast.error("Please select an exam and file!");
    }
  };

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (individualExamId && questionText && individualOptions.length > 1 && selectedCorrectIndex !== '' && subjectName) {
      try {
        const options = individualOptions.filter(o => o.trim()).map(o => ({ text: o.trim() }));
        if (options.length === 0) {
          toast.error("Please add options!");
          return;
        }
        const correctIndex = parseInt(selectedCorrectIndex);
        if (correctIndex >= options.length) {
          toast.error("Invalid correct index!");
          return;
        }
        const token = localStorage.getItem("adminToken");
        const response = await fetch(`http://52.87.175.51:8000/admin/exams/${individualExamId}/questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: questionText.trim(),
            options: options,
            correct_index: correctIndex,
            subject_name: subjectName.trim(),
          }),
        });

        if (response.ok) {
          toast.success("Question added successfully!");
          setIsIndividualDialogOpen(false);
          setIndividualExamId('');
          setQuestionText('');
          setIndividualOptions(['']);
          setSelectedCorrectIndex('0');
          setSubjectName('');
        } else {
          toast.error("Failed to add question. Please try again.");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      }
    } else {
      toast.error("Please fill all fields!");
    }
  };

  const handleCollegeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (collegeData.name && collegeData.passkey && collegeData.passkey_expires_at) {
      try {
        const expiresAt = new Date(collegeData.passkey_expires_at).toISOString();
        const token = localStorage.getItem("adminToken");
        const url = isEditMode && editingCollege 
          ? `http://52.87.175.51:8000/admin/colleges/${editingCollege.id}`
          : "http://52.87.175.51:8000/admin/colleges";
        const method = isEditMode ? "PUT" : "POST";
        const body = isEditMode 
          ? JSON.stringify({
              name: collegeData.name,
              passkey: collegeData.passkey,
              passkey_expires_at: expiresAt,
              is_active: true,
            })
          : JSON.stringify({
              name: collegeData.name,
              passkey: collegeData.passkey,
              passkey_expires_at: expiresAt,
            });

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body,
        });

        if (response.ok) {
          toast.success(isEditMode ? "College updated successfully!" : "College added successfully!");
          setIsCollegeDialogOpen(false);
          setCollegeData({ name: "", passkey: "", passkey_expires_at: "" });
          setIsEditMode(false);
          setEditingCollege(null);
          fetchColleges();
        } else {
          toast.error(`Failed to ${isEditMode ? 'update' : 'add'} college. Please try again.`);
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      }
    } else {
      toast.error("Please fill all fields!");
    }
  };

  const handleEditCollege = (college: College) => {
    setIsEditMode(true);
    setEditingCollege(college);
    setCollegeData({
      name: college.name,
      passkey: college.passkey,
      passkey_expires_at: new Date(college.passkey_expires_at).toISOString().slice(0, 16),
    });
    setIsCollegeDialogOpen(true);
  };

  const handleDeleteCollege = async (id: number) => {
    if (!confirm("Are you sure you want to delete this college?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`http://52.87.175.51:8000/admin/colleges/${id}?hard=false`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success("College deleted successfully!");
        fetchColleges();
      } else {
        toast.error("Failed to delete college. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  const handleAddSubject = () => {
    setExamData({ ...examData, subjects: [...examData.subjects, ''] });
  };

  const handleSubjectChange = (index: number, value: string) => {
    const updated = [...examData.subjects];
    updated[index] = value;
    setExamData({ ...examData, subjects: updated });
  };

  const handleAddIndivOption = () => {
    setIndividualOptions([...individualOptions, '']);
  };

  const handleIndivOptionChange = (index: number, value: string) => {
    const updated = [...individualOptions];
    updated[index] = value;
    setIndividualOptions(updated);
  };

  const handleExamChange = (value: string) => {
    setSelectedExamId(value);
  };

  const handleBulkExamChange = (value: string) => {
    setBulkExamId(value);
  };

  const handleIndivExamChange = (value: string) => {
    setIndividualExamId(value);
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBulkFile(file);
  };

  const handleViewBreakdown = (result: Result) => {
    setSelectedResult(result);
    setIsBreakdownDialogOpen(true);
  };

  const handleExamTitleChange = (value: string) => {
    setExamData({ ...examData, title: value });
  };

  const handleExamCategoryChange = (value: string) => {
    setExamData({ ...examData, category: value });
  };

  const sectionTabs = [
    { id: 1, label: 'Registered Students' },
    { id: 2, label: 'Exams' },
    { id: 3, label: 'Student Results' },
    { id: 4, label: 'College List' },
    { id: 5, label: 'Contacts' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Super Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage students, MCQs, exams, and results.</p>
        </div>

        {/* Section Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8 border-b border-gray-200">
            {sectionTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Section 1: Registered Students */}
        {activeSection === 1 && (
          <section className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">List of Registered Students</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.user_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.user_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.qualification}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.college}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.city}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section 2: Exams */}
        {activeSection === 2 && (
          <section className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Exams List</h2>
              <div className="flex space-x-2">
                <Button onClick={() => setIsBulkDialogOpen(true)}>Bulk Upload Questions</Button>
                <Button onClick={() => setIsIndividualDialogOpen(true)}>Add Individual Question</Button>
                <Button onClick={() => setIsCreateExamOpen(true)}>Create Exam</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Window Start</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Window End</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration (min)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{exam.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.window_start}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.window_end}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{exam.duration_minutes}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                        <button className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section 3: Student Results */}
        {activeSection === 3 && (
          <section className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Student Results</h2>
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium">Select Exam:</Label>
                <Select value={selectedExamId} onValueChange={handleExamChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exam ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.length > 0 ? results.map((result) => (
                    <tr key={result.attemptId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.studentName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.examId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.score}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.percentage}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{result.submittedAt}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewBreakdown(result)}
                        >
                          View Breakdown
                        </Button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">No results available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section 4: College List */}
        {activeSection === 4 && (
          <section className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">College List</h2>
              <Button onClick={() => {
                setIsEditMode(false);
                setEditingCollege(null);
                setCollegeData({ name: "", passkey: "", passkey_expires_at: "" });
                setIsCollegeDialogOpen(true);
              }}>Add College</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {colleges.map((college) => (
                    <tr key={college.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{college.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{college.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{college.passkey_expires_at}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEditCollege(college)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteCollege(college.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Section 5: Contacts */}
        {activeSection === 5 && (
          <section className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Contacts</h2>
            </div>
            <div className="space-y-8 p-6">
              {/* Student Contacts */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">Student Contacts</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qualification</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passed Out Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">College</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contactStudents.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{contact.qualification}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.passedout_year}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{contact.college}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{contact.purpose}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* College Contacts */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">College Contacts</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Point of Contact</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contactColleges.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{contact.location}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.contact}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{contact.designation}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{contact.point_of_contact}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recruiter Contacts */}
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-4">Recruiter Contacts</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Point of Contact Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Using Platform</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {contactRecruiters.map((contact) => (
                        <tr key={contact.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{contact.company_name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{contact.designation}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{contact.point_of_contact_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.phone}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contact.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{contact.using_platform}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Breakdown Dialog */}
      <Dialog open={isBreakdownDialogOpen} onOpenChange={setIsBreakdownDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Subject Breakdown</DialogTitle>
            <DialogDescription className="text-center">
              Detailed performance by subject for {selectedResult?.studentName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedResult?.breakdown.map((bd, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bd.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bd.correct}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bd.total}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bd.percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Button onClick={() => setIsBreakdownDialogOpen(false)} className="w-full mt-4">
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* Add/Edit College Dialog */}
      <Dialog open={isCollegeDialogOpen} onOpenChange={setIsCollegeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              {isEditMode ? 'Edit College' : 'Add New College'}
            </DialogTitle>
            <DialogDescription className="text-center">
              {isEditMode ? 'Update college details' : 'Enter college details to create a new entry'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCollegeSubmit} className="space-y-6">
            <div>
              <Label htmlFor="college-name" className="text-sm font-medium">College Name</Label>
              <Input
                id="college-name"
                value={collegeData.name}
                onChange={(e) => setCollegeData({ ...collegeData, name: e.target.value })}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <Label htmlFor="college-passkey" className="text-sm font-medium">Passkey</Label>
              <Input
                id="college-passkey"
                type="text"
                value={collegeData.passkey}
                onChange={(e) => setCollegeData({ ...collegeData, passkey: e.target.value })}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <Label htmlFor="college-expires-at" className="text-sm font-medium">Passkey Expires At</Label>
              <Input
                id="college-expires-at"
                type="datetime-local"
                value={collegeData.passkey_expires_at}
                onChange={(e) => setCollegeData({ ...collegeData, passkey_expires_at: e.target.value })}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl">
              {isEditMode ? 'Update College' : 'Add College'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Bulk Upload Questions</DialogTitle>
            <DialogDescription className="text-center">Select exam and upload MCQs file</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBulkSubmit} className="space-y-6">
            <div>
              <Label htmlFor="bulk-exam" className="text-sm font-medium">Select Exam</Label>
              <Select value={bulkExamId} onValueChange={handleBulkExamChange}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bulk-file" className="text-sm font-medium">MCQs File</Label>
              <Input
                id="bulk-file"
                type="file"
                accept=".csv,.json"
                onChange={handleBulkFileChange}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl">
              Upload Bulk Questions
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Individual Question Dialog */}
      <Dialog open={isIndividualDialogOpen} onOpenChange={setIsIndividualDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Add Individual Question</DialogTitle>
            <DialogDescription className="text-center">Enter question details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleIndividualSubmit} className="space-y-6">
            <div>
              <Label htmlFor="indiv-exam" className="text-sm font-medium">Select Exam</Label>
              <Select value={individualExamId} onValueChange={handleIndivExamChange}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select an exam" />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="question-text" className="text-sm font-medium">Question Text</Label>
              <Input
                id="question-text"
                type="text"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter question"
                required
                className="h-12 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <Label htmlFor="subject-name" className="text-sm font-medium">Subject Name</Label>
              <Input
                id="subject-name"
                type="text"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
                placeholder="Enter subject"
                required
                className="h-12 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Options</Label>
              <div className="space-y-2">
                {individualOptions.map((option, index) => (
                  <Input
                    key={index}
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleIndivOptionChange(index, e.target.value)}
                    className="h-12 rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddIndivOption}
                  className="w-full h-12 rounded-xl"
                >
                  + Add Option
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="correct-index" className="text-sm font-medium">Correct Option Index</Label>
              <Select value={selectedCorrectIndex} onValueChange={setSelectedCorrectIndex}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Select correct option" />
                </SelectTrigger>
                <SelectContent>
                  {individualOptions.map((_, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      Option {index + 1}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl">
              Add Question
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Exam Dialog */}
      <Dialog open={isCreateExamOpen} onOpenChange={setIsCreateExamOpen}>
        <DialogContent className="sm:max-w-xl max-h-[70vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-center">Create New Exam</DialogTitle>
            <DialogDescription className="text-center">Enter exam details</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4">
            <form onSubmit={handleCreateExamSubmit} className="space-y-4">
              <div>
                <Label htmlFor="exam-title" className="text-sm font-medium">Title</Label>
                <Input
                  id="exam-title"
                  type="text"
                  value={examData.title}
                  onChange={(e) => setExamData({ ...examData, title: e.target.value })}
                  placeholder="Enter exam title"
                  required
                  className="h-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <Label htmlFor="exam-category" className="text-sm font-medium">Category</Label>
                <Select value={examData.category} onValueChange={handleExamCategoryChange} required>
                  <SelectTrigger className="h-10 rounded-lg">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="nontechnical">Non-technical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="exam-description" className="text-sm font-medium">Description</Label>
                <Input
                  id="exam-description"
                  value={examData.description}
                  onChange={(e) => setExamData({ ...examData, description: e.target.value })}
                  className="h-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <Label htmlFor="exam-window-start" className="text-sm font-medium">Window Start</Label>
                <Input
                  id="exam-window-start"
                  type="datetime-local"
                  value={examData.window_start}
                  onChange={(e) => setExamData({ ...examData, window_start: e.target.value })}
                  required
                  className="h-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <Label htmlFor="exam-window-end" className="text-sm font-medium">Window End</Label>
                <Input
                  id="exam-window-end"
                  type="datetime-local"
                  value={examData.window_end}
                  onChange={(e) => setExamData({ ...examData, window_end: e.target.value })}
                  required
                  className="h-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <Label htmlFor="exam-duration" className="text-sm font-medium">Duration (minutes)</Label>
                <Input
                  id="exam-duration"
                  type="number"
                  value={examData.duration_minutes}
                  onChange={(e) => setExamData({ ...examData, duration_minutes: parseInt(e.target.value) || 30 })}
                  required
                  className="h-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Subjects</Label>
                <div className="space-y-2">
                  {examData.subjects.map((subject, index) => (
                    <Input
                      key={index}
                      type="text"
                      placeholder={`Subject ${index + 1}`}
                      value={subject}
                      onChange={(e) => handleSubjectChange(index, e.target.value)}
                      className="h-10 rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddSubject}
                    className="w-full h-10 rounded-lg"
                  >
                    + Add Subject
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 rounded-lg">
                Create Exam
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;