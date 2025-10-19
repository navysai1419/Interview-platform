import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import techlogo from "../assests/techlogo.png"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Menu, X, Lightbulb, Target, AlertCircle, PlayCircle, Users, Code, Zap, BarChart3, Shield, Globe, Brain } from "lucide-react";
import { toast } from "sonner";

const Landing = () => {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loginData, setLoginData] = useState({ 
    email: "", 
    password: "", 
    collegePasskey: "",
    collegeName: ""
  });
  const [adminLoginData, setAdminLoginData] = useState({ 
    email: "", 
    password: "" 
  });
  const [contactType, setContactType] = useState("student");
  const [contactData, setContactData] = useState({});
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch("https://api.devtalent.securxperts.com:8000/admin/colleges");
        if (response.ok) {
          const data = await response.json();
          setColleges(data);
        } else {
          console.error("Failed to fetch colleges");
        }
      } catch (error) {
        console.error("Network error fetching colleges:", error);
      }
    };

    fetchColleges();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.email && loginData.password && loginData.collegePasskey && loginData.collegeName) {
      try {
        const response = await fetch("https://api.devtalent.securxperts.com:8000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: loginData.email,
            password: loginData.password,
            college_name: loginData.collegeName,
            college_passkey: loginData.collegePasskey,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userEmail", loginData.email);
          localStorage.setItem("userCollege", loginData.collegeName);
          localStorage.setItem("userToken", data.access_token);
          toast.success("Login successful!");
          setIsLoginOpen(false);
          setLoginData({ email: "", password: "", collegePasskey: "", collegeName: "" });
          navigate("/terms");
        } else {
          toast.error("Login failed. Please check your credentials.");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      }
    } else {
      toast.error("Please fill all fields!");
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminLoginData.email && adminLoginData.password) {
      try {
        const response = await fetch("https://api.devtalent.securxperts.com:8000/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: adminLoginData.email,
            password: adminLoginData.password,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("isAdminAuthenticated", "true");
          localStorage.setItem("adminEmail", adminLoginData.email);
          localStorage.setItem("adminToken", data.access_token);
          toast.success("Admin login successful!");
          setIsAdminLoginOpen(false);
          setAdminLoginData({ email: "", password: "" });
          navigate("/dashboard");
        } else {
          toast.error("Admin login failed. Please check your credentials.");
        }
      } catch (error) {
        toast.error("Network error. Please try again.");
      }
    } else {
      toast.error("Please fill all fields!");
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let url = "";
    let body: any = {
      email: contactData.email,
      extras: {},
    };

    switch (contactType) {
      case "student":
        url = "https://api.devtalent.securxperts.com:8000/contact/student";
        body = {
          ...body,
          name: contactData.name,
          qualification: contactData.qualification,
          passedout_year: contactData.passedout_year,
          college: contactData.college,
          purpose: contactData.purpose,
          phone: contactData.phone,
        };
        break;
      case "college":
        url = "https://api.devtalent.securxperts.com:8000/contact/college";
        body = {
          ...body,
          name: contactData.name,
          location: contactData.location,
          contact: contactData.contact,
          designation: contactData.designation,
          point_of_contact: contactData.point_of_contact,
        };
        break;
      case "recruiter":
        url = "https://api.devtalent.securxperts.com:8000/contact/recruiter";
        body = {
          ...body,
          company_name: contactData.company_name,
          designation: contactData.designation,
          point_of_contact_name: contactData.point_of_contact_name,
          phone: contactData.phone,
          using_platform: contactData.using_platform,
        };
        break;
      default:
        toast.error("Please select a contact type.");
        return;
    }

    if (!body.email || Object.keys(body).filter(key => key !== 'email' && key !== 'extras').some(key => !body[key])) {
      toast.error("Please fill all fields!");
      return;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        toast.success("Contact form submitted successfully!");
        setIsContactOpen(false);
        setContactData({});
        setContactType("student");
      } else {
        toast.error("Failed to submit contact form. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    }
  };

  const painPoints = [
    {
      icon: AlertCircle,
      title: "Time-Consuming Interviews",
      description: "Traditional interviews are lengthy and inefficient, leading to delays in hiring processes.",
      image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: Target,
      title: "Subjective Evaluations",
      description: "Bias in assessments makes it hard to objectively measure candidate skills.",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: Lightbulb,
      title: "Scalability Issues",
      description: "Handling large volumes of candidates overwhelms manual processes.",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: Code,
      title: "Lack of Technical Depth",
      description: "Standard tests fail to assess real-world coding and problem-solving abilities.",
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
  ];

  const solutions = [
    {
      icon: Shield,
      title: "AI-Powered Assessments",
      description: "Automated evaluations with real-time feedback for unbiased results.",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: Zap,
      title: "Scalable Platform",
      description: "Easily manage thousands of candidates with seamless integration.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: Code,
      title: "Live Coding Challenges",
      description: "Interactive tests that simulate real interview scenarios.",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
    {
      icon: BarChart3,
      title: "Data-Driven Insights",
      description: "Analytics to identify top talent and streamline hiring decisions.",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca4a5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
    },
  ];

  const galleryImages = [
    {
      src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      alt: "Innovative team collaboration",
      animation: "fade-in-left"
    },
    {
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      alt: "Data analysis dashboard",
      animation: "fade-in-right"
    },
    {
      src: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      alt: "Coding challenge interface",
      animation: "zoom-in"
    },
    {
      src: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
      alt: "AI assessment tools",
      animation: "slide-up"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-x-hidden">
      {/* Enhanced Floating Particles Background with More Particles and Variations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-float-${i % 3 + 1} ${i % 2 === 0 ? 'bg-primary/30' : 'bg-purple-500/20'}`}
            style={{
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${8 + Math.random() * 12}s`
            }}
          />
        ))}
        {/* Additional Sparkle Effect */}
        {[...Array(10)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute w-1 h-1 bg-gradient-to-r from-yellow-400 to-transparent rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 1.5}s`,
              animationDuration: `${3 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Enhanced Header with Glassmorphism - Sticky with Subtle Float */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/10 border-b border-white/20 shadow-xl animate-subtle-float">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300 group">
              <img src={techlogo} alt="DevTalent Logo" className="w-32 h-12 object-contain drop-shadow-lg group-hover:rotate-12 transition-transform duration-700" />
            </div>
            
            {/* Desktop Nav with Glow on Hover */}
            <nav className="hidden md:flex items-center space-x-6">
              {[
                { href: "#home", label: "Home" },
                { href: "#about", label: "About" },
                { href: "#vision", label: "Vision" },
                { href: "#pain-points", label: "Pain Points" },
                { href: "#solution", label: "Solution" },
                { href: "#gallery", label: "Gallery" },
                { href: "#demo", label: "Demo" }
              ].map((item) => (
                <a 
                  key={item.href}
                  href={item.href} 
                  className="text-foreground hover:text-primary transition-all duration-300 relative group hover:-translate-y-1 text-sm hover:shadow-glow"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-600 transition-all duration-300 group-hover:w-full"></span>
                </a>
              ))}
            </nav>

            {/* Mobile Menu Button with Spin */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground hover:text-primary group"
              >
                {isMobileMenuOpen ? <X size={24} className="group-hover:rotate-180 transition-transform duration-300" /> : <Menu size={24} className="group-hover:rotate-180 transition-transform duration-300" />}
              </Button>
            </div>

            {/* Desktop Login Buttons with Pulse */}
            <div className="hidden md:flex items-center space-x-2">
              <div className="hover:scale-105 transition-transform duration-300">
                <Button onClick={() => setIsLoginOpen(true)} className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl text-sm px-4 py-2 animate-pulse-subtle">
                  Login
                </Button>
              </div>
              <div className="hover:scale-105 transition-transform duration-300">
                <Button onClick={() => setIsContactOpen(true)} className="bg-gradient-to-r from-green-600 to-green-800 hover:from-green-600/90 hover:to-green-800/90 shadow-lg hover:shadow-xl text-sm px-4 py-2 animate-pulse-subtle">
                  Contact US
                </Button>
              </div>
              <div className="hover:scale-105 transition-transform duration-300">
                <Button onClick={() => setIsAdminLoginOpen(true)} className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-600/90 hover:to-gray-800/90 shadow-lg hover:shadow-xl text-sm px-4 py-2 animate-pulse-subtle">
                  Admin Login
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Menu with Slide and Fade */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200 animate-slide-down-enhanced">
              <nav className="flex flex-col space-y-4">
                {[
                  { href: "#home", label: "Home" },
                  { href: "#about", label: "About" },
                  { href: "#vision", label: "Vision" },
                  { href: "#pain-points", label: "Pain Points" },
                  { href: "#solution", label: "Solution" },
                  { href: "#gallery", label: "Gallery" },
                  { href: "#demo", label: "Demo" }
                ].map((item, idx) => (
                  <a 
                    key={item.href}
                    href={item.href} 
                    className="text-foreground hover:text-primary transition-all duration-300 py-2 hover:translate-x-2 animate-slide-in-right stagger-item"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
                <div className="space-y-2 pt-2">
                  <Button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLoginOpen(true);
                    }} 
                    className="w-full bg-gradient-to-r from-primary to-purple-600 animate-slide-in-right stagger-item"
                    style={{ animationDelay: '0.7s' }}
                  >
                    Login
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsContactOpen(true);
                    }} 
                    className="w-full bg-gradient-to-r from-green-600 to-green-800 animate-slide-in-right stagger-item"
                    style={{ animationDelay: '0.8s' }}
                  >
                    Contact US
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAdminLoginOpen(true);
                    }} 
                    className="w-full bg-gradient-to-r from-gray-600 to-gray-800 animate-slide-in-right stagger-item"
                    style={{ animationDelay: '0.9s' }}
                  >
                    Admin Login
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Enhanced Parallax and Typing Effect */}
      <section id="home" className="relative py-8 px-4 overflow-hidden min-h-[60vh] flex items-center justify-center animate-section-reveal">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 animate-parallax-enhanced"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-purple-600/80 animate-gradient-shift" />
        <div className="container mx-auto text-center relative z-10 animate-hero-entrance">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent animate-typewriter">
            The World's Most Advanced
            <br />
            <span className="text-gradient animate-glow">Interview Assessment Platform</span>
          </h1>
          <p className="text-lg md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto animate-fade-in-up stagger-delay">
            Prepare, practice, and perform your best — anytime, anywhere.
          </p>
          <div className="animate-bounce-enhanced">
            <Button 
              onClick={() => setIsLoginOpen(true)} 
              className="text-lg py-4 px-8 shadow-2xl hover:shadow-3xl bg-white text-primary font-bold rounded-full hover:scale-105 transition-all duration-300 animate-shimmer"
            >
              Start Your Journey <ArrowRight className="ml-2 w-5 h-5 animate-pulse" />
            </Button>
          </div>
        </div>
      </section>

      {/* About Section with Asymmetric Layout, Image, and Morphing Background */}
      <section id="about" className="py-8 px-4 relative animate-section-reveal">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-b from-primary/10 to-transparent animate-morph-shape" />
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-center animate-stagger-enhanced">
            <div className="order-2 lg:order-1">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent animate-reveal-text">
                About <span className="text-gradient animate-wave">DevTalent</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6 animate-fade-in-up stagger-delay">
                DevTalent is a revolutionary platform designed to transform the interview and assessment process. 
                Powered by advanced AI and real-time analytics, we empower students, colleges, recruiters, and companies 
                to discover and develop top talent efficiently and fairly.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="hover:translate-x-2 transition-transform duration-300 group">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-blue-50 animate-card-flip">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary group-hover:rotate-360 transition-transform duration-1000" /> Mission</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>To bridge the gap between talent and opportunity through innovative assessment tools.</CardDescription>
                    </CardContent>
                  </Card>
                </div>
                <div className="hover:translate-x-2 transition-transform duration-300 group">
                  <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50 animate-card-flip delay-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-purple-600 group-hover:rotate-360 transition-transform duration-1000" /> Impact</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>Serving thousands of users worldwide with secure, scalable, and insightful evaluations.</CardDescription>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 relative hover:scale-105 transition-transform duration-500 group">
              <img 
                src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Team collaborating on assessment platform"
                className="w-full h-[300px] object-cover rounded-2xl shadow-2xl animate-image-float group-hover:rotate-3 transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section with Floating Elements and Orbiting Icons */}
      <section id="vision" className="py-8 px-4 bg-gradient-to-br from-indigo-50 to-purple-50 relative overflow-hidden animate-section-reveal">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent animate-radial-pulse" />
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-primary to-purple-600 rounded-full opacity-20 animate-spin-slow"></div>
        {/* Orbiting Icons */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="absolute w-8 h-8 bg-white/20 rounded-full flex items-center justify-center animate-orbit"
              style={{
                animationDelay: `${i * 0.5}s`,
                transform: `rotate(${i * 90}deg) translateX(100px) rotate(-${i * 90}deg)`
              }}
            >
              <Target className="w-4 h-4 text-primary" />
            </div>
          ))}
        </div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent animate-reveal-text">
            Our <span className="text-gradient animate-wave">Vision</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up stagger-delay">
            To create a world where every talented individual is discovered and nurtured, eliminating barriers in the hiring process 
            and fostering a merit-based ecosystem for global innovation.
          </p>
          <div className="relative mx-auto w-32 h-32 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center shadow-2xl scale-110 animate-pulse-enhanced">
            <Target className="text-white animate-spin-slow" size={40} />
          </div>
        </div>
      </section>

      {/* Pain Points Section with Image Cards and Ripple Effect */}
      <section id="pain-points" className="py-8 px-4 animate-section-reveal">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-foreground to-red-500/80 bg-clip-text text-transparent animate-reveal-text">
            Common <span className="text-gradient animate-wave">Pain Points</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger-enhanced">
            {painPoints.map((point, index) => (
              <div key={index} className="group cursor-pointer hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                <Card className="border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br from-red-50 to-red-100 overflow-hidden h-full animate-card-ripple">
                  <CardHeader className="text-center p-4">
                    <div className="relative inline-block mb-3 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:animate-bounce">
                        <point.icon className="text-white group-hover:animate-spin" size={24} />
                      </div>
                    </div>
                    <CardTitle className="group-hover:text-red-600 transition-colors text-lg font-bold animate-fade-in-up stagger-item" style={{ animationDelay: `${index * 0.1}s` }}>
                      {point.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed animate-fade-in-up stagger-item" style={{ animationDelay: `${index * 0.1 + 0.1}s` }}>
                      {point.description}
                    </CardDescription>
                  </CardContent>
                  <img 
                    src={point.image}
                    alt={point.title}
                    className="w-full h-24 object-cover mt-3 group-hover:scale-105 transition-transform duration-300 animate-slide-up-enhanced"
                  />
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section with Image Cards and Glow Pulse */}
      <section id="solution" className="py-8 px-4 bg-gradient-to-br from-blue-50 to-indigo-100 animate-section-reveal">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent animate-reveal-text">
            Our <span className="text-gradient animate-wave">Solution</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger-enhanced">
            {solutions.map((solution, index) => (
              <div key={index} className="group cursor-pointer hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
                <Card className="border-0 shadow-lg hover:shadow-2xl bg-gradient-to-br from-primary/5 to-blue-50 overflow-hidden h-full animate-card-glow">
                  <CardHeader className="text-center p-4">
                    <div className="relative inline-block mb-3 group-hover:scale-110 transition-transform duration-300">
                      <div className="w-14 h-14 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:animate-bounce">
                        <solution.icon className="text-white group-hover:animate-spin" size={24} />
                      </div>
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors text-lg font-bold animate-fade-in-up stagger-item" style={{ animationDelay: `${index * 0.1}s` }}>
                      {solution.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed animate-fade-in-up stagger-item" style={{ animationDelay: `${index * 0.1 + 0.1}s` }}>
                      {solution.description}
                    </CardDescription>
                  </CardContent>
                  <img 
                    src={solution.image}
                    alt={solution.title}
                    className="w-full h-24 object-cover mt-3 group-hover:scale-105 transition-transform duration-300 animate-zoom-in-enhanced"
                  />
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section with More Images, Different Animations, and Masonry Flip */}
      <section id="gallery" className="py-8 px-4 bg-gradient-to-r from-gray-50 to-white animate-section-reveal">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent animate-reveal-text">
            Visual <span className="text-gradient animate-wave">Journey</span>
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger-enhanced">
            {galleryImages.map((img, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 animate-flip-3d">
                <img 
                  src={img.src}
                  alt={img.alt}
                  className={`w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500 ${img.animation} group-hover:brightness-110`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 animate-slide-in-bottom">
                  <p className="text-white text-xs font-medium animate-fade-in">{img.alt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section with Enhanced Player and Border Glow */}
      <section id="demo" className="py-8 px-4 relative animate-section-reveal">
        <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-gradient-to-t from-primary/20 to-transparent animate-wave-border" />
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent animate-reveal-text">
            Watch Our <span className="text-gradient animate-wave">Demo</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up stagger-delay">
            See DevTalent in action and discover how it simplifies assessments and unlocks potential.
          </p>
          <div className="max-w-2xl mx-auto relative">
            <div className="relative bg-black rounded-3xl overflow-hidden shadow-2xl animate-border-glow">
              <div className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white w-20 h-20 opacity-80 hover:opacity-100 transition-all duration-300 cursor-pointer hover:scale-110 animate-spin-subtle">
                <PlayCircle size={80} className="animate-pulse" />
              </div>
              <iframe
                className="w-full aspect-video"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" // Replace with actual demo URL
                title="DevTalent Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Staggered Fade and Glow */}
      <footer className="bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white py-6 px-4 relative overflow-hidden animate-section-reveal">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent animate-radial-pulse" />
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-6 mb-6 animate-stagger-enhanced">
            <div className="animate-fade-in-up stagger-item">
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-wave">DevTalent</h3>
              <p className="text-gray-400 leading-relaxed text-sm animate-fade-in-up stagger-delay">The world's most advanced interview assessment platform.</p>
            </div>
            <div className="animate-fade-in-up stagger-item" style={{ animationDelay: '0.1s' }}>
              <h4 className="font-semibold mb-3 text-gray-300 text-sm">Company</h4>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors hover:animate-pulse">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:animate-pulse">Contact</a></li>
              </ul>
            </div>
            <div className="animate-fade-in-up stagger-item" style={{ animationDelay: '0.2s' }}>
              <h4 className="font-semibold mb-3 text-gray-300 text-sm">Legal</h4>
              <ul className="space-y-1 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors hover:animate-pulse">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors hover:animate-pulse">Terms of Service</a></li>
              </ul>
            </div>
            <div className="animate-fade-in-up stagger-item" style={{ animationDelay: '0.3s' }}>
              <h4 className="font-semibold mb-3 text-gray-300 text-sm">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:animate-bounce text-lg">Twitter</a>
                <a href="#" className="text-gray-400 hover:text-white transition-all duration-300 hover:scale-110 hover:animate-bounce text-lg">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-gray-400 text-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <p>&copy; 2025 DevTalent Exam Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Login Dialog with Slide In Fields */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-blue-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Welcome Back</DialogTitle>
            <DialogDescription className="text-center">Login to access your exam portal</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="login-password" className="text-sm font-medium">Password</Label>
              <Input
                id="login-password"
                type="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="login-college-name" className="text-sm font-medium">College Name</Label>
              <Select onValueChange={(value) => setLoginData({ ...loginData, collegeName: value })} value={loginData.collegeName}>
                <SelectTrigger className="h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary">
                  <SelectValue placeholder="Select College" />
                </SelectTrigger>
                <SelectContent>
                  {colleges.map((college: any) => (
                    <SelectItem key={college.id} value={college.name}>
                      {college.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="login-college-passkey" className="text-sm font-medium">College Passkey</Label>
              <Input
                id="login-college-passkey"
                type="password"
                value={loginData.collegePasskey}
                onChange={(e) => setLoginData({ ...loginData, collegePasskey: e.target.value })}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 rounded-xl shadow-lg">
              Login
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Login Dialog - Similar Enhancements */}
      <Dialog open={isAdminLoginOpen} onOpenChange={setIsAdminLoginOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-gray-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Admin Login</DialogTitle>
            <DialogDescription className="text-center">Login to access the admin portal</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <Label htmlFor="admin-email" className="text-sm font-medium">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={adminLoginData.email}
                onChange={(e) => setAdminLoginData({ ...adminLoginData, email: e.target.value })}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <Label htmlFor="admin-password" className="text-sm font-medium">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminLoginData.password}
                onChange={(e) => setAdminLoginData({ ...adminLoginData, password: e.target.value })}
                required
                className="h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button type="submit" className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 rounded-xl shadow-lg">
              Admin Login
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog with Dynamic Field Animations */}
      <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
        <DialogContent className="w-full max-w-xs 2xs:max-w-sm xs:max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl 2xl:max-w-3xl bg-gradient-to-br from-white to-green-50">
          <div className="flex flex-col h-[70vh] max-h-[70vh]">
            <DialogHeader className="sticky top-0 bg-background z-10 border-b">
              <DialogTitle className="text-2xl font-bold text-center">Contact Us</DialogTitle>
              <DialogDescription className="text-center">Fill out the form to get in touch with us</DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="contact-type" className="text-sm font-medium">Contact Type</Label>
                  <Select value={contactType} onValueChange={(value) => {
                    setContactType(value);
                    setContactData({});
                  }}>
                    <SelectTrigger className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary">
                      <SelectValue placeholder="Select contact type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="recruiter">Recruiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contact-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={contactData.email || ""}
                    onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                    required
                    className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                {contactType === "student" && (
                  <>
                    <div>
                      <Label htmlFor="contact-name" className="text-sm font-medium">Name</Label>
                      <Input
                        id="contact-name"
                        type="text"
                        value={contactData.name || ""}
                        onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-qualification" className="text-sm font-medium">Qualification</Label>
                      <Input
                        id="contact-qualification"
                        type="text"
                        value={contactData.qualification || ""}
                        onChange={(e) => setContactData({ ...contactData, qualification: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-passedout-year" className="text-sm font-medium">Passed Out Year</Label>
                      <Input
                        id="contact-passedout-year"
                        type="text"
                        value={contactData.passedout_year || ""}
                        onChange={(e) => setContactData({ ...contactData, passedout_year: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-college" className="text-sm font-medium">College</Label>
                      <Input
                        id="contact-college"
                        type="text"
                        value={contactData.college || ""}
                        onChange={(e) => setContactData({ ...contactData, college: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-purpose" className="text-sm font-medium">Purpose</Label>
                      <Textarea
                        id="contact-purpose"
                        value={contactData.purpose || ""}
                        onChange={(e) => setContactData({ ...contactData, purpose: e.target.value })}
                        required
                        className="h-20 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone" className="text-sm font-medium">Phone</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        value={contactData.phone || ""}
                        onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </>
                )}

                {contactType === "college" && (
                  <>
                    <div>
                      <Label htmlFor="contact-name" className="text-sm font-medium">Name</Label>
                      <Input
                        id="contact-name"
                        type="text"
                        value={contactData.name || ""}
                        onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-location" className="text-sm font-medium">Location</Label>
                      <Input
                        id="contact-location"
                        type="text"
                        value={contactData.location || ""}
                        onChange={(e) => setContactData({ ...contactData, location: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-contact" className="text-sm font-medium">Contact</Label>
                      <Input
                        id="contact-contact"
                        type="text"
                        value={contactData.contact || ""}
                        onChange={(e) => setContactData({ ...contactData, contact: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-designation" className="text-sm font-medium">Designation</Label>
                      <Input
                        id="contact-designation"
                        type="text"
                        value={contactData.designation || ""}
                        onChange={(e) => setContactData({ ...contactData, designation: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-point-of-contact" className="text-sm font-medium">Point of Contact</Label>
                      <Input
                        id="contact-point-of-contact"
                        type="text"
                        value={contactData.point_of_contact || ""}
                        onChange={(e) => setContactData({ ...contactData, point_of_contact: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </>
                )}

                {contactType === "recruiter" && (
                  <>
                    <div>
                      <Label htmlFor="contact-company-name" className="text-sm font-medium">Company Name</Label>
                      <Input
                        id="contact-company-name"
                        type="text"
                        value={contactData.company_name || ""}
                        onChange={(e) => setContactData({ ...contactData, company_name: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-designation" className="text-sm font-medium">Designation</Label>
                      <Input
                        id="contact-designation"
                        type="text"
                        value={contactData.designation || ""}
                        onChange={(e) => setContactData({ ...contactData, designation: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-point-of-contact-name" className="text-sm font-medium">Point of Contact Name</Label>
                      <Input
                        id="contact-point-of-contact-name"
                        type="text"
                        value={contactData.point_of_contact_name || ""}
                        onChange={(e) => setContactData({ ...contactData, point_of_contact_name: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone" className="text-sm font-medium">Phone</Label>
                      <Input
                        id="contact-phone"
                        type="tel"
                        value={contactData.phone || ""}
                        onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-using-platform" className="text-sm font-medium">Using Platform</Label>
                      <Input
                        id="contact-using-platform"
                        type="text"
                        value={contactData.using_platform || ""}
                        onChange={(e) => setContactData({ ...contactData, using_platform: e.target.value })}
                        required
                        className="h-10 sm:h-12 rounded-xl border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-12 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-600/90 hover:to-green-800/90 rounded-xl shadow-lg"
                >
                  Submit
                </Button>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(-10px) rotate(240deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }
        .animate-float-1 { animation: float-1 8s ease-in-out infinite; }
        .animate-float-2 { animation: float-2 10s ease-in-out infinite; }
        .animate-float-3 { animation: float-3 12s ease-in-out infinite; }
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-twinkle { animation: twinkle 4s ease-in-out infinite; }
        @keyframes subtle-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }
        .animate-subtle-float { animation: subtle-float 3s ease-in-out infinite; }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
        }
        .hover\\:shadow-glow:hover { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
        .animate-pulse-subtle { animation: subtle-float 2s infinite; }
        @keyframes slide-down-enhanced {
          from { opacity: 0; max-height: 0; transform: translateY(-20px); }
          to { opacity: 1; max-height: 500px; transform: translateY(0); }
        }
        .animate-slide-down-enhanced { animation: slide-down-enhanced 0.4s ease-out; }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.6s ease-out forwards; }
        .stagger-item { animation-fill-mode: forwards; }
        @keyframes section-reveal {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-section-reveal { animation: section-reveal 1s ease-out forwards; }
        @keyframes parallax-enhanced {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        .animate-parallax-enhanced { animation: parallax-enhanced 15s ease-in-out infinite; }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-shift { 
          background-size: 400% 400%; 
          animation: gradient-shift 15s ease infinite; 
        }
        @keyframes hero-entrance {
          from { opacity: 0; transform: scale(0.9) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-hero-entrance { animation: hero-entrance 1.2s ease-out forwards; }
        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }
        .animate-typewriter {
          overflow: hidden;
          white-space: nowrap;
          border-right: 0.15em solid transparent;
          animation: typewriter 3s steps(40, end), blink-caret 0.75s step-end infinite;
        }
        @keyframes blink-caret {
          from, to { border-color: transparent; }
          50% { border-color: currentColor; }
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 5px currentColor; }
          50% { text-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
        }
        .animate-glow { animation: glow 2s ease-in-out infinite alternate; }
        @keyframes bounce-enhanced {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-15px); }
          60% { transform: translateY(-8px); }
        }
        .animate-bounce-enhanced { animation: bounce-enhanced 2.5s infinite; }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        @keyframes morph-shape {
          0%, 100% { border-radius: 0 50% 0 0; }
          50% { border-radius: 50% 0 50% 0; }
        }
        .animate-morph-shape { animation: morph-shape 10s ease-in-out infinite; }
        @keyframes stagger-enhanced {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-stagger-enhanced > * {
          animation: stagger-enhanced 0.8s ease-out forwards;
        }
        .animate-stagger-enhanced > *:nth-child(1) { animation-delay: 0.1s; }
        .animate-stagger-enhanced > *:nth-child(2) { animation-delay: 0.2s; }
        .animate-stagger-enhanced > *:nth-child(3) { animation-delay: 0.3s; }
        .animate-stagger-enhanced > *:nth-child(4) { animation-delay: 0.4s; }
        .stagger-delay { animation-delay: 0.3s; }
        @keyframes reveal-text {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-reveal-text { animation: reveal-text 0.8s ease-out forwards; }
        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-wave { animation: wave 1.5s ease-in-out infinite; }
        @keyframes card-flip {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(180deg); }
        }
        .animate-card-flip { 
          transition: transform 0.6s; 
          transform-style: preserve-3d; 
        }
        .group:hover .animate-card-flip { transform: perspective(1000px) rotateY(180deg); }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        @keyframes image-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-image-float { animation: image-float 4s ease-in-out infinite; }
        @keyframes radial-pulse {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.2); opacity: 0.05; }
        }
        .animate-radial-pulse { animation: radial-pulse 5s ease-in-out infinite; }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(100px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(100px) rotate(-360deg); }
        }
        .animate-orbit { animation: orbit 10s linear infinite; }
        @keyframes pulse-enhanced {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse-enhanced { animation: pulse-enhanced 2s ease-in-out infinite; }
        @keyframes slide-up-enhanced {
          from { opacity: 0; transform: translateY(30px) scale(0.9); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up-enhanced { animation: slide-up-enhanced 0.7s ease-out forwards; }
        @keyframes zoom-in-enhanced {
          from { opacity: 0; transform: scale(0.8) rotate(-5deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        .animate-zoom-in-enhanced { animation: zoom-in-enhanced 0.7s ease-out forwards; }
        @keyframes flip-3d {
          0% { transform: rotateY(0deg) rotateX(0deg); }
          100% { transform: rotateY(180deg) rotateX(180deg); }
        }
        .animate-flip-3d { 
          transition: transform 0.8s; 
          transform-style: preserve-3d; 
        }
        .group:hover .animate-flip-3d { transform: rotateY(10deg) rotateX(5deg); }
        @keyframes slide-in-bottom {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in-bottom { animation: slide-in-bottom 0.5s ease-out forwards; }
        @keyframes wave-border {
          0%, 100% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
          50% { clip-path: polygon(0 10%, 100% 0, 100% 90%, 0 100%); }
        }
        .animate-wave-border { animation: wave-border 8s ease-in-out infinite; }
        @keyframes border-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.6), 0 0 40px rgba(59, 130, 246, 0.4); }
        }
        .animate-border-glow { animation: border-glow 3s ease-in-out infinite; }
        @keyframes spin-subtle {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-subtle { animation: spin-subtle 20s linear infinite; }
        @keyframes dialog-slide-in {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-dialog-slide-in { animation: dialog-slide-in 0.4s ease-out; }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.6s ease-out; }
        @keyframes input-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.5); }
        }
        .animate-input-glow:focus { animation: input-glow 1.5s ease-in-out infinite; }
        @keyframes card-ripple {
          0% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(255, 0, 0, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
        }
        .animate-card-ripple:hover { animation: card-ripple 1.5s ease-out; }
        @keyframes card-glow {
          0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 25px rgba(59, 130, 246, 0.6); }
        }
        .animate-card-glow:hover { animation: card-glow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Landing;
// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';

// interface DevTalentComponentProps {
//   productName?: string;
//   brandLogo?: string;
// }

// const DevTalentComponent: React.FC<DevTalentComponentProps> = ({ productName = 'Dev Talent', brandLogo = 'logo.png' }) => {
//   const [currentScene, setCurrentScene] = useState(1);
//   const totalScenes = 4;
//   const sceneDuration = 4000; // 4 seconds per scene

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setCurrentScene((prev) => (prev < totalScenes ? prev + 1 : 1));
//     }, sceneDuration);

//     return () => clearTimeout(timer);
//   }, [currentScene]);

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { duration: 0.5 } },
//     exit: { opacity: 0, transition: { duration: 0.5 } }
//   };

//   const productVariants = {
//     hidden: { scale: 0, opacity: 0 },
//     visible: { scale: 1, opacity: 1, transition: { duration: 1, ease: 'easeOut' } }
//   };

//   const iconVariants = {
//     hidden: { scale: 0, opacity: 0 },
//     visible: (i: number) => ({
//       scale: 1,
//       opacity: 1,
//       transition: { delay: i * 0.2, duration: 0.5, ease: 'easeOut' }
//     })
//   };

//   const fadeInVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: (i: number) => ({
//       opacity: 1,
//       y: 0,
//       transition: { delay: i * 0.3, duration: 0.5 }
//     })
//   };

//   const slideInVariants = {
//     hidden: { x: -100, opacity: 0 },
//     visible: { x: 0, opacity: 1, transition: { duration: 0.6 } }
//   };

//   const painPoints = [
//     { name: 'Manual Grading Delays', icon: '⏳' },
//     { name: 'Cheating Risks', icon: '🚫' },
//     { name: 'Inaccurate Assessments', icon: '❌' },
//     { name: 'Scalability Issues', icon: '📈' },
//     { name: 'Lack of Real-time Insights', icon: '📊' },
//     { name: 'High Administrative Overhead', icon: '📋' }
//   ];

//   const solutions = [
//     { name: 'Automated Grading', icon: '🤖' },
//     { name: 'Secure Proctoring', icon: '🔒' },
//     { name: 'AI-Driven Insights', icon: '🧠' },
//     { name: 'Scalable Platform', icon: '☁️' }
//   ];

//   return (
//     <div className="w-screen h-screen flex justify-center items-center font-sans overflow-hidden relative" style={{ background: 'linear-gradient(to bottom, #667eea 0%, #764ba2 100%)' }}>
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={currentScene}
//           variants={containerVariants}
//           initial="hidden"
//           animate="visible"
//           exit="exit"
//           className="w-full h-full flex flex-col justify-center items-center p-5 box-border scene"
//         >
//           {currentScene === 1 && (
//             <motion.div className="flex flex-col justify-center items-center" variants={containerVariants}>
//               <motion.div className="mb-5 product" variants={productVariants}>
//                 <div className="product-icon">📱</div> {/* Placeholder for Dev Talent platform icon */}
//               </motion.div>
//               <motion.div className="books-elements absolute top-1/4 left-1/4 text-6xl opacity-30" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
//                 📚 📖 📚
//               </motion.div>
//               <motion.div className="books-elements absolute bottom-1/4 right-1/4 text-6xl opacity-30" animate={{ y: [0, 10, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}>
//                 📖 📚 📖
//               </motion.div>
//               <motion.h2 variants={slideInVariants} initial="hidden" animate="visible" className="text-5xl text-white text-center m-0 drop-shadow-lg">
//                 {productName}
//               </motion.h2>
//               <motion.p className="text-xl text-blue-100 text-center mt-2 drop-shadow-md">Revolutionary Exam Platform for Developer Talent</motion.p>
//             </motion.div>
//           )}

//           {currentScene === 2 && (
//             <motion.div className="flex flex-col justify-center items-center" variants={containerVariants}>
//               <h3 className="text-4xl text-white text-center mb-8 drop-shadow-lg">Common Pain Points</h3>
//               <div className="pain-points-layout flex flex-col items-center gap-8 w-full max-w-6xl">
//                 {/* Row 1: 1st pain point + human image on right */}
//                 <motion.div 
//                   className="row1 flex items-center justify-center gap-10 w-full flex-col sm:flex-row" 
//                   initial="hidden" 
//                   animate="visible" 
//                   variants={slideInVariants}
//                 >
//                   <motion.div
//                     className="pain-point-item flex flex-col items-center p-6 bg-white/20 rounded-xl shadow-lg min-w-[150px] backdrop-blur-sm"
//                     variants={fadeInVariants}
//                     custom={0}
//                   >
//                     <div className="icon text-6xl mb-2.5">{painPoints[0].icon}</div>
//                     <p className="m-0 text-lg text-white text-center">{painPoints[0].name}</p>
//                   </motion.div>
//                   <div className="human-image text-8xl">👨‍💻</div>
//                 </motion.div>

//                 {/* Row 2: 2nd pain point */}
//                 <motion.div 
//                   className="row2 flex justify-center" 
//                   initial="hidden" 
//                   animate="visible" 
//                   variants={slideInVariants}
//                 >
//                   <motion.div
//                     className="pain-point-item flex flex-col items-center p-6 bg-white/20 rounded-xl shadow-lg min-w-[150px] backdrop-blur-sm"
//                     variants={fadeInVariants}
//                     custom={1}
//                   >
//                     <div className="icon text-6xl mb-2.5">{painPoints[1].icon}</div>
//                     <p className="m-0 text-lg text-white text-center">{painPoints[1].name}</p>
//                   </motion.div>
//                 </motion.div>

//                 {/* 6th pain point (top of the next row) */}
//                 <motion.div 
//                   className="row6 flex justify-center" 
//                   initial="hidden" 
//                   animate="visible" 
//                   variants={slideInVariants}
//                 >
//                   <motion.div
//                     className="pain-point-item flex flex-col items-center p-6 bg-white/20 rounded-xl shadow-lg min-w-[150px] backdrop-blur-sm"
//                     variants={fadeInVariants}
//                     custom={5}
//                   >
//                     <div className="icon text-6xl mb-2.5">{painPoints[5].icon}</div>
//                     <p className="m-0 text-lg text-white text-center">{painPoints[5].name}</p>
//                   </motion.div>
//                 </motion.div>

//                 {/* Row for 3rd, 4th, 5th pain points */}
//                 <motion.div 
//                   className="row345 flex gap-5 justify-center flex-wrap" 
//                   initial="hidden" 
//                   animate="visible" 
//                   variants={slideInVariants}
//                 >
//                   {[2, 3, 4].map((idx) => (
//                     <motion.div
//                       key={painPoints[idx].name}
//                       className="pain-point-item flex flex-col items-center p-6 bg-white/20 rounded-xl shadow-lg min-w-[150px] backdrop-blur-sm"
//                       variants={fadeInVariants}
//                       custom={idx}
//                     >
//                       <div className="icon text-6xl mb-2.5">{painPoints[idx].icon}</div>
//                       <p className="m-0 text-lg text-white text-center">{painPoints[idx].name}</p>
//                     </motion.div>
//                   ))}
//                 </motion.div>
//               </div>
//             </motion.div>
//           )}

//           {currentScene === 3 && (
//             <motion.div className="flex flex-col md:flex-row justify-center items-start p-10 w-full gap-10" variants={containerVariants}>
//               <div className="left-side flex-1 flex flex-col gap-5 items-center">
//                 <h3 className="text-4xl text-white self-center drop-shadow-lg">Our Solutions</h3>
//                 {solutions.map((sol, i) => (
//                   <motion.div
//                     key={sol.name}
//                     className="solution-item flex flex-col items-center p-6 bg-white/20 rounded-xl shadow-lg min-w-[180px] backdrop-blur-sm"
//                     variants={slideInVariants}
//                     initial="hidden"
//                     animate="visible"
//                     custom={i}
//                   >
//                     <div className="icon text-6xl mb-2.5">{sol.icon}</div>
//                     <p className="m-0 text-lg text-white text-center">{sol.name}</p>
//                   </motion.div>
//                 ))}
//               </div>
//               <motion.div className="right-side flex-1 flex justify-center items-center" variants={productVariants}>
//                 <div className="hand-product flex items-center">
//                   <div className="hand text-8xl mr-2.5 text-white">✋</div>
//                   <div className="product-icon text-white">📱</div>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}

//           {currentScene === 4 && (
//             <motion.div className="flex flex-col justify-center items-center relative" variants={containerVariants}>
//               <motion.div className="mb-5 product" variants={productVariants} animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
//                 <div className="product-icon">📱</div>
//               </motion.div>
//               <motion.div className="floating-elements absolute top-1/4 left-1/10 text-4xl pointer-events-none z-10 text-white opacity-70" animate={{ y: [-10, 10] }} transition={{ duration: 3, repeat: Infinity, yoyo: true }}>
//                 <span className="block m-2.5">💻</span>
//                 <span className="block m-2.5" style={{ animationDelay: '1s' }}>🔍</span>
//                 <span className="block m-2.5" style={{ animationDelay: '2s' }}>⭐</span>
//               </motion.div>
//               <motion.h1 className="tagline text-6xl text-white text-center m-5 font-bold drop-shadow-lg" variants={fadeInVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
//                 Assess. Hire. Excel.
//               </motion.h1>
//               <motion.div className="cta flex flex-col items-center gap-2.5" variants={fadeInVariants} initial="hidden" animate="visible" transition={{ delay: 1 }}>
//                 <img src={brandLogo} alt="Brand Logo" className="logo w-25 h-auto filter brightness-0 invert" />
//                 <p className="text-xl text-blue-100 drop-shadow-md">Discover Top Developer Talent Today.</p>
//               </motion.div>
//             </motion.div>
//           )}
//         </motion.div>
//       </AnimatePresence>
//       <div className="scene-indicator absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/50 text-white px-5 py-2.5 rounded-full text-sm">
//         Scene {currentScene} of {totalScenes}
//       </div>

//       <style jsx>{`
//         .product-icon {
//           font-size: 100px;
//           background: rgba(255, 255, 255, 0.2);
//           width: 150px;
//           height: 150px;
//           border-radius: 20px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           color: white;
//           box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
//           backdrop-filter: blur(10px);
//         }
//         .floating-elements span {
//           animation: float 3s ease-in-out infinite;
//         }
//         @keyframes float {
//           0%, 100% { transform: translateY(0px); }
//           50% { transform: translateY(-10px); }
//         }
//         @media (max-width: 768px) {
//           .flex-row {
//             flex-direction: column;
//           }
//           .pain-points-layout {
//             gap: 4;
//           }
//           .row1, .row345 {
//             flex-direction: column;
//             align-items: center;
//           }
//           .row345 {
//             gap: 2.5;
//           }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default DevTalentComponent;