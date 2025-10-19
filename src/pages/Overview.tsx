import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Clock, FileText, Trophy, AlertCircle, Check, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface ExamPaper {
  attempt_id: number;
  exam_id: number;
  questions: Array<{
    question_id: number;
    subject: string;
    text: string;
    image_url?: string | null;
    options: Array<{ id: number; text: string; image_url?: string | null }>;
  }>;
  ends_at: string;
}

interface SubjectAnswers {
  [subject: string]: Array<{ question_id: number; chosen_option_id: number }>;
}

const Overview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email: passedEmail, attemptData: passedAttemptData } = location.state || {};
  const userEmail = passedEmail || localStorage.getItem("userEmail") || "Student";
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialDuration, setInitialDuration] = useState(0);
  const [paper, setPaper] = useState<ExamPaper | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [completedSubjects, setCompletedSubjects] = useState<Set<string>>(new Set());
  const [subjectAnswers, setSubjectAnswers] = useState<SubjectAnswers>({});
  const [isLoading, setIsLoading] = useState(true);
  const [autoSubmitTrigger, setAutoSubmitTrigger] = useState(false);
  const token = localStorage.getItem("userToken");

  // Load attemptData stably from localStorage
  const attemptId = passedAttemptData?.attempt_id;
  let attemptData;
  if (attemptId) {
    const savedAttemptStr = localStorage.getItem(`attemptData_${attemptId}`);
    if (savedAttemptStr) {
      attemptData = JSON.parse(savedAttemptStr);
    } else if (passedAttemptData) {
      attemptData = passedAttemptData;
      localStorage.setItem(`attemptData_${attemptId}`, JSON.stringify(attemptData));
    }
  }

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated");
    if (!isAuth) {
      navigate("/");
      return;
    }

    if (!attemptData || !attemptData.attempt_id) {
      toast.error("Invalid attempt data");
      navigate("/terms");
      return;
    }

    // Initial time calculation (based on difference between current time and ends_at, +5:30 hours for UTC)
    const parsed = new Date(attemptData.ends_at);
    const adjusted = new Date(parsed.getTime() + (5 * 60 * 60 + 30 * 60) * 1000); // +5:30 hours
    const parsedEndsAt = adjusted.getTime();
    const now = Date.now();
    let initialTimeLeft = Math.max(0, Math.floor((parsedEndsAt - now) / 1000));
    setTimeLeft(initialTimeLeft);
    setInitialDuration(initialTimeLeft);

    // Load or fetch data
    const loadOrFetch = async () => {
      setIsLoading(true);
      const savedPaperStr = localStorage.getItem(`paper_${attemptData.attempt_id}`);
      const savedAnswersStr = localStorage.getItem(`subjectAnswers_${attemptData.attempt_id}`);
      const savedCompletedStr = localStorage.getItem(`completedSubjects_${attemptData.attempt_id}`);

      if (savedPaperStr && savedAnswersStr && savedCompletedStr) {
        try {
          const data: ExamPaper = JSON.parse(savedPaperStr);
          setPaper(data);
          const uniqueSubjects = [...new Set(data.questions.map((q) => q.subject))];
          setSubjects(uniqueSubjects);
          setSubjectAnswers(JSON.parse(savedAnswersStr));
          setCompletedSubjects(new Set(JSON.parse(savedCompletedStr)));
          setIsLoading(false);
          return;
        } catch (e) {
          console.error('Error loading saved data:', e);
        }
      }

      // Fetch if no saved or error
      try {
        const response = await fetch(`https://api.devtalent.securxperts.com:8000/exam/attempts/${attemptData.attempt_id}/paper`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch exam paper`);
        }

        const data: ExamPaper = await response.json();
        console.log('Paper fetched successfully:', data);
        setPaper(data);
        localStorage.setItem(`paper_${attemptData.attempt_id}`, JSON.stringify(data));
        const uniqueSubjects = [...new Set(data.questions.map((q) => q.subject))];
        setSubjects(uniqueSubjects);

        // Load saved answers and completed if available
        if (savedAnswersStr) {
          setSubjectAnswers(JSON.parse(savedAnswersStr));
        }
        if (savedCompletedStr) {
          setCompletedSubjects(new Set(JSON.parse(savedCompletedStr)));
        }
      } catch (err) {
        console.error('Paper Fetch Error:', err);
        toast.error("Failed to load exam paper. Please try starting again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadOrFetch();

    // Timer (based on difference, +5:30 hours for UTC)
    const timer = setInterval(() => {
      const parsedTimer = new Date(attemptData.ends_at);
      const adjustedTimer = new Date(parsedTimer.getTime() + (5 * 60 * 60 + 30 * 60) * 1000); // +5:30 hours
      const currentEndsAt = adjustedTimer.getTime();
      const currentTimeLeft = Math.max(0, Math.floor((currentEndsAt - Date.now()) / 1000));
      setTimeLeft(currentTimeLeft);
      if (currentTimeLeft <= 0) {
        clearInterval(timer);
        // Show alert for time up in the middle
        if (window.confirm("Time's up! Do you want to submit the exam now?")) {
          handleFinalSubmit(true); // Auto-submit on time up
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, attemptId, token]); // Depend on attemptId instead of attemptData

  // Persist state to localStorage
  useEffect(() => {
    if (attemptData?.attempt_id) {
      localStorage.setItem(`subjectAnswers_${attemptData.attempt_id}`, JSON.stringify(subjectAnswers));
      localStorage.setItem(`completedSubjects_${attemptData.attempt_id}`, JSON.stringify(Array.from(completedSubjects)));
    }
  }, [subjectAnswers, completedSubjects, attemptData]);

  // Listen for navigation back from exam with submitted data
  useEffect(() => {
    if (location.state && location.state.fromExam) {
      const { subject, answers, totalQuestions } = location.state.fromExam;
      if (subject && answers) {
        setCompletedSubjects(prev => new Set([...prev, subject]));
        setSubjectAnswers(prev => ({ ...prev, [subject]: answers }));
        toast.success(`Section ${subject} submitted successfully! (${answers.length}/${totalQuestions} answered)`);
      }
      // Clear the state to avoid re-processing
      navigate(location.pathname, { replace: true, state: { ...location.state, fromExam: undefined } });
    }
  }, [location.state, navigate]);

  // Auto-submit trigger
  useEffect(() => {
    if (autoSubmitTrigger) {
      handleFinalSubmit(true);
      setAutoSubmitTrigger(false);
    }
  }, [autoSubmitTrigger]);

  // Handle timeUp from exam
  useEffect(() => {
    if (location.state?.timeUp) {
      setAutoSubmitTrigger(true);
      navigate(location.pathname, { replace: true, state: { ...location.state, timeUp: undefined } });
    }
  }, [location.state, navigate]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartSubject = (subject: string, subjectQuestions: ExamPaper["questions"]) => {
    if (!paper || completedSubjects.has(subject)) return;
    navigate("/exam", {
      state: {
        questions: subjectQuestions,
        ends_at: paper.ends_at,
        attempt_id: paper.attempt_id,
        subject, // Pass subject for identification
      },
    });
  };

  const stopMediaStreams = () => {
    const cameraStream = (window as any).cameraStream as MediaStream | undefined;
    const micStream = (window as any).micStream as MediaStream | undefined;

    if (cameraStream) {
      cameraStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      (window as any).cameraStream = null;
    }

    if (micStream) {
      micStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      (window as any).micStream = null;
    }
  };

  const handleFinalSubmit = async (autoSubmit = false) => {
  const confirmed = autoSubmit ? true : window.confirm("Are you sure you want to submit the complete exam?");
  if (!confirmed) return;

  try {
    // Aggregate all answers from subjects
    const allAnswers = [];
    Object.entries(subjectAnswers).forEach(([_, answers]) => {
      allAnswers.push(...answers);
    });

    console.log('Submitting answers:', allAnswers); // Log for debugging

    const response = await fetch(`https://api.devtalent.securxperts.com:8000/exam/attempts/${attemptData.attempt_id}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ answers: allAnswers }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Submit response error:', errorText); // Log server error message
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail === "Already submitted") {
          // Clear localStorage after successful submit
          if (attemptData?.attempt_id) {
            localStorage.removeItem(`paper_${attemptData.attempt_id}`);
            localStorage.removeItem(`subjectAnswers_${attemptData.attempt_id}`);
            localStorage.removeItem(`completedSubjects_${attemptData.attempt_id}`);
            localStorage.removeItem(`attemptData_${attemptData.attempt_id}`);
          }

          stopMediaStreams();
          toast.warning("Already submitted");
          navigate("/success", {
            state: {
              questionsAttempted: allAnswers.length,
              totalQuestions: paper ? paper.questions.length : 0,
              timeTaken: initialDuration - timeLeft,
            },
          });
          return;
        }
      } catch (parseError) {
        // Not JSON, proceed with error
      }
      throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to submit exam'}`);
    }

    // Clear localStorage after successful submit
    if (attemptData?.attempt_id) {
      localStorage.removeItem(`paper_${attemptData.attempt_id}`);
      localStorage.removeItem(`subjectAnswers_${attemptData.attempt_id}`);
      localStorage.removeItem(`completedSubjects_${attemptData.attempt_id}`);
      localStorage.removeItem(`attemptData_${attemptData.attempt_id}`);
    }

    stopMediaStreams();
    toast.success("Exam submitted successfully!");
    navigate("/success", {
      state: {
        questionsAttempted: allAnswers.length,
        totalQuestions: paper ? paper.questions.length : 0,
        timeTaken: initialDuration - timeLeft,
      },
    });
  } catch (error) {
    console.error("Final Submit Error:", error);
    toast.error("Failed to submit exam. Please try again.");
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-xl font-medium text-primary">Loading exam overview...</p>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500 h-12 w-12" />
          <p className="text-xl font-semibold text-red-600 mb-2">Failed to load exam.</p>
          <Button onClick={() => navigate("/terms")} variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const totalQuestions = paper.questions.length;
  const allSectionsCompleted = subjects.every(subject => completedSubjects.has(subject));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      {/* Header Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-primary to-purple-600 rounded-full">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Time Remaining</p>
                <p className="text-xl font-bold text-primary animate-pulse">{formatTime(timeLeft)}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Student</p>
                <p className="font-semibold text-sm">{userEmail}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              {allSectionsCompleted && (
                <Button onClick={() => handleFinalSubmit()} variant="destructive" className="px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-shadow">
                  Final Submit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Exam Overview
          </h1>
          <p className="text-lg text-muted-foreground font-medium">Review the exam structure and get ready to shine</p>
        </div>

        {/* Exam Info Cards - Smaller Size */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="hover-lift group shadow-md border-0 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="text-center py-4">
              <FileText className="mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" size={32} />
              <CardTitle className="text-lg font-bold">Total Questions</CardTitle>
              <CardDescription className="text-xl font-bold text-foreground">{totalQuestions}</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-3 text-xs text-muted-foreground font-medium">
              Across all sections
            </CardContent>
          </Card>

          <Card className="hover-lift group shadow-md border-0 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="text-center py-4">
              <Trophy className="mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" size={32} />
              <CardTitle className="text-lg font-bold">Passing Marks</CardTitle>
              <CardDescription className="text-xl font-bold text-foreground">55%</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-3 text-xs text-muted-foreground font-medium">
              Achieve excellence
            </CardContent>
          </Card>
        </div>

        {/* Instructions and Exam Sections - Side by Side with Adjusted Widths */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left: Exam Sections - Wider */}
          <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="text-primary" size={24} />
                <CardTitle className="text-xl font-bold">Exam Sections</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Accordion type="single" collapsible className="w-full">
                {subjects.map((subject) => {
                  const subjectQuestions = paper.questions.filter((q) => q.subject === subject);
                  const isCompleted = completedSubjects.has(subject);
                  return (
                    <AccordionItem key={subject} value={subject} className="mb-2 border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
                      <AccordionTrigger className="text-base font-semibold px-4 py-3 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3">
                            <FileText className="text-primary" size={18} />
                            <span>{subject} ({subjectQuestions.length} Qs)</span>
                          </div>
                          {isCompleted && <Check className="text-green-600" size={20} />}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        <div className="grid md:grid-cols-2 gap-2">
                          {subjectQuestions.map((q, idx) => (
                            <div key={q.question_id} className="p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded-md border border-gray-200 text-xs">
                              <p className="font-medium text-gray-800">Q{idx + 1}</p>
                              <p className="text-gray-600 line-clamp-2">{q.text}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Button
                            onClick={() => handleStartSubject(subject, subjectQuestions)}
                            className="w-full px-4 py-2 font-medium shadow-sm hover:shadow-md transition-shadow"
                            disabled={isCompleted}
                            variant={isCompleted ? "secondary" : "default"}
                          >
                            {isCompleted ? `✓ ${subject} Completed` : `Start ${subject}`}
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </CardContent>
          </Card>

          {/* Right: Important Instructions - Narrower */}
          <Card className="lg:col-span-1 shadow-lg border-orange-200/50 bg-gradient-to-br from-orange-50 to-orange-100/50 backdrop-blur-sm hover:shadow-xl transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="text-orange-600" size={24} />
                <CardTitle className="text-xl font-bold text-orange-700">Important Instructions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start space-x-2">
                  <AlertCircle className="text-orange-500 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-gray-700">Once started, the timer cannot be paused—stay focused!</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertCircle className="text-orange-500 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-gray-700">Navigate freely within sections, but answers lock after submission.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertCircle className="text-orange-500 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-gray-700">Camera & mic stay active for proctoring—ensure clear view.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <AlertCircle className="text-orange-500 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-gray-700">Auto-submit on timeout—save progress regularly.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Overview;