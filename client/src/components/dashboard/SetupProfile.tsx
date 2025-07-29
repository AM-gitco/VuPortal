import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { GraduationCap, BookOpen, CheckCircle, ChevronRight, ChevronLeft, BookText, Users, BarChart, ShieldCheck, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// ==================== Schema & Types ====================
const setupSchema = z.object({
  degreeProgram: z.string().min(1, "Please select your degree program"),
  subjects: z.array(z.string()).min(1, "Please select at least one subject"),
});

type SetupData = z.infer<typeof setupSchema>;

interface SetupProfileProps {
  user: any;
}

// ==================== Theme Types ====================
type Theme = 'light' | 'dark' | 'transparent';

// ==================== Constants ====================
const degreePrograms = [
  { value: "BSCS", label: "BS Computer Science", color: "from-blue-500 to-indigo-500", emoji: "👨‍💻" },
  { value: "BSIT", label: "BS Information Technology", color: "from-cyan-500 to-teal-500", emoji: "🌐" },
  { value: "BSSE", label: "BS Software Engineering", color: "from-violet-500 to-purple-500", emoji: "🛠️" },
  { value: "MCS", label: "MS Computer Science", color: "from-amber-500 to-orange-500", emoji: "🎓" },
  { value: "MIT", label: "MS Information Technology", color: "from-rose-500 to-pink-500", emoji: "🔌" },
  { value: "MBA", label: "Master of Business Administration", color: "from-emerald-500 to-green-500", emoji: "💼" },
  { value: "BBA", label: "Bachelor of Business Administration", color: "from-lime-500 to-green-500", emoji: "📊" },
  { value: "BSPHY", label: "BS Physics", color: "from-red-500 to-rose-500", emoji: "⚛️" },
  { value: "BSMATH", label: "BS Mathematics", color: "from-yellow-500 to-amber-500", emoji: "🧮" },
];

const subjectEmojis: Record<string, string> = {
  "Programming": "💻",
  "Data Structures": "📚",
  "Computer Architecture": "🖥️",
  "Software Engineering": "🛠️",
  "Operations Research": "📈",
  "Differential Equations": "∫",
  "Research Methods": "🔍",
  "E-Commerce": "💳",
  "Knowledge Management": "🧠",
  "Web Design": "🕸️",
  "Project Management": "📋",
  "Algorithms": "🔢",
  "Database": "💾",
  "Advanced": "🚀"
};

const subjectsByDegreeAndSemester: Record<string, Record<number, string[]>> = {
  BSCS: {
    1: ["CS201 - Introduction to Programming", "MTH101 - Calculus I"],
    2: ["CS301 - Data Structures", "MTH102 - Calculus II"],
    3: ["CS401 - Computer Architecture", "CS301 - Data Structures"],
    4: ["CS501 - Software Engineering", "MTH601 - Operations Research"],
    5: ["MTH632 - Differential Equations", "STA630 - Research Methods"]
  },
  BSIT: {
    1: ["CS201 - Introduction to Programming", "IT101 - IT Fundamentals"],
    2: ["CS301 - Data Structures", "IT201 - Networking Basics"],
    3: ["IT430 - E-Commerce", "IT301 - Database Systems"],
    4: ["IT630 - Knowledge Management", "STA630 - Research Methods"]
  },
  BSSE: {
    1: ["CS201 - Introduction to Programming", "SE101 - Software Engineering Principles"],
    2: ["CS301 - Data Structures", "SE201 - Requirements Engineering"],
    3: ["CS501 - Software Engineering", "SE301 - Software Design"],
    4: ["CS506 - Web Design and Development", "SWE622 - Software Project Management"]
  },
  MCS: {
    1: ["CS701 - Advanced Computer Architecture", "CS702 - Advanced Algorithms"],
    2: ["CS703 - Advanced Database Systems", "STA630 - Research Methods"]
  }
};

// ==================== Helper Functions ====================
const getEmojiForSubject = (subject: string) => {
  const keywords = Object.keys(subjectEmojis);
  for (const keyword of keywords) {
    if (subject.includes(keyword)) {
      return subjectEmojis[keyword];
    }
  }
  return "📚";
};

const getAvailableSubjects = (degree: string, semester: number | null) => {
  if (!degree) return [];
  
  if (semester === null) {
    return Object.values(subjectsByDegreeAndSemester[degree] || {}).flat();
  }
  
  return subjectsByDegreeAndSemester[degree]?.[semester] || [];
};

// ==================== Reusable Components ====================
interface UniversityInfoPanelProps {
  theme: Theme;
}

const UniversityInfoPanel = ({ theme }: UniversityInfoPanelProps) => {
  const isTransparent = theme === 'transparent';
  
  return (
    <div className={`w-full lg:w-[40%] p-6 text-white flex flex-col relative overflow-hidden ${
      isTransparent 
        ? 'bg-gradient-to-r from-blue-800/0 to-blue-800/10 backdrop-blur-xl'
        : theme === 'dark' 
          ? 'bg-gradient-to-br from-blue-900 to-indigo-900'
          : 'bg-gradient-to-br from-blue-800 to-indigo-700'
    }`}>
      {isTransparent && (
        <div className="absolute inset-0 opacity-100">
          <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] animate-rotate-slow bg-[conic-gradient(from_0deg,rgba(30,58,138,0.3)_10%,rgba(138,173,232,0.8)_40%,rgba(0,0,0,0)_70%)] rounded-full"></div>
</div>
      )}
      
      <div className="relative z-10">
        <div className="flex items-center mb-8 animate-fade-in">
          <div className="bg-white/20 p-3 rounded-xl mr-4 transition-all duration-300 hover:scale-105 group">
            <GraduationCap className="text-white transition-transform duration-500 group-hover:rotate-y-180" size={30} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">VU PORTAL</h1>
            <p className="text-blue-200 text-sm mt-1">Virtual University of Pakistan</p>
          </div>
        </div>
        
        <div className="mb-8 flex-1">
          <h2 className="text-2xl font-bold mb-6 leading-tight animate-fade-in">Welcome to Student Portal</h2>
          <p className="text-blue-100 mb-8 text-base animate-fade-in delay-100">
            Complete your profile setup to access personalized academic resources and join our learning community.
          </p>
          
          <div className="space-y-6">
            {[
              { 
                icon: <BookText className="text-blue-200" size={20} />,
                title: "Academic Resources",
                desc: "Access syllabus, lectures, and past papers anytime"
              },
              { 
                icon: <Users className="text-blue-200" size={20} />,
                title: "Collaborative Learning",
                desc: "Connect with peers and instructors"
              },
              { 
                icon: <BarChart className="text-blue-200" size={20} />,
                title: "Progress Tracking",
                desc: "Monitor your academic performance"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className={`flex items-start p-4 rounded-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm animate-fade-in border group ${
                  isTransparent
                    ? 'bg-blue-900/30 hover:bg-blue-900/40 border-blue-700/30'
                    : theme === 'dark'
                      ? 'bg-blue-900/50 hover:bg-blue-900/60 border-blue-800'
                      : 'bg-blue-800/50 hover:bg-blue-800/60 border-blue-700'
                }`}
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <div className={`p-3 rounded-lg mr-4 flex-shrink-0 transition-all duration-300 group-hover:scale-110 ${
                  isTransparent
                    ? 'bg-blue-500/30 group-hover:bg-blue-500/50'
                    : theme === 'dark'
                      ? 'bg-blue-500/40 group-hover:bg-blue-500/60'
                      : 'bg-blue-500/50 group-hover:bg-blue-500/70'
                }`}>
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base mb-1">{item.title}</h3>
                  <p className="text-blue-100">{item.desc}</p>
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <ChevronRight className="text-blue-300" size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className={`mt-1 pt-4 border-t animate-fade-in delay-500 ${
          isTransparent
            ? 'border-blue-700/50'
            : theme === 'dark'
              ? 'border-blue-800'
              : 'border-blue-700'
        }`}>
          <div className="flex items-center text-blue-200 mb-2">
            <ShieldCheck className="mr-2" size={18} />
            <span className="font-medium">Secure Academic Portal</span>
          </div>
          <p className="text-blue-100 text-sm">
            All your academic data is protected with end-to-end encryption and never shared with third parties.
          </p>
        </div>
      </div>
    </div>
  );
};

interface SetupProgressProps {
  step: number;
  completedSteps: number;
  selectedDegreeColor: string;
  progress: number;
}

const SetupProgress = ({ step, completedSteps, selectedDegreeColor, progress }: SetupProgressProps) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {completedSteps === 0 
          ? "Step 0 of 3" 
          : completedSteps === 1 
            ? "Step 1 of 3" 
            : completedSteps === 2
              ? "Step 2 of 3"
              : "Step 3 of 3"}
      </span>
      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
        {step === 1 ? "Degree Program" : step === 2 ? "Semester" : "Subjects"}
      </span>
    </div>
    <div className="relative pt-1">
      <div className="relative h-2.5 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <div 
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out ${selectedDegreeColor || "from-blue-500 to-indigo-500"} bg-gradient-to-r`}
          style={{ width: `${progress}%` }}
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${selectedDegreeColor || "from-blue-400 to-indigo-400"} animate-progress-pulse opacity-70`}></div>
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
        <span>Program</span>
        <span>Semester</span>
        <span>Subjects</span>
      </div>
    </div>
  </div>
);

interface DegreeSelectionStepProps {
  form: any;
  selectedDegree: string;
  selectedDegreeLabel: string;
  selectedDegreeColor: string;
  selectedDegreeEmoji: string;
  onNext: () => void;
}

const DegreeSelectionStep = ({ 
  form, 
  selectedDegree, 
  selectedDegreeLabel, 
  selectedDegreeColor, 
  selectedDegreeEmoji, 
  onNext 
}: DegreeSelectionStepProps) => (
  <div className="flex-1 flex flex-col animate-fade-in">
    <div className="space-y-6 flex-1">
      <div>
        <h3 className="text-base font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3 transition-all duration-300 hover:scale-105 group">
            <GraduationCap className="text-blue-600 dark:text-blue-400 group-hover:animate-bounce" size={18} />
          </div>
          <span>Select Your Degree Program</span>
        </h3>
        
        <FormField
          control={form.control}
          name="degreeProgram"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sr-only">Degree Program</FormLabel>
              <FormControl>
                <div className="relative">
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <SelectTrigger className="h-12 rounded-lg border border-gray-300 dark:border-gray-700 transition-all duration-300 hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm">
                      <SelectValue placeholder="Choose your degree program" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg shadow-lg max-h-60 animate-fade-in-up border border-gray-200 dark:border-gray-700">
                      {degreePrograms.map((degree) => (
                        <SelectItem 
                          key={degree.value} 
                          value={degree.value}
                          className="py-3 hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 group/item"
                        >
                          <div className="flex items-center">
                            <span className="text-xl mr-3">{degree.emoji}</span>
                            <div className="flex-1">{degree.label}</div>
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${degree.color} ml-3 transition-transform group-hover/item:scale-125`}></div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <ChevronRight className="animate-bounce-horizontal" size={18} />
                  </div>
                </div>
              </FormControl>
              <FormMessage className="font-medium mt-2 animate-fade-in" />
            </FormItem>
          )}
        />
      </div>
      
      {selectedDegree && (
        <div className={`bg-gradient-to-r ${selectedDegreeColor} bg-opacity-10 rounded-lg p-4 mt-auto animate-fade-in-up border border-transparent transition-all duration-700 relative overflow-hidden`}>
          <div className="flex items-center">
            <span className="text-3xl mr-3">{selectedDegreeEmoji}</span>
            <div>
              <h4 className="font-medium text-gray-800 dark:text-white">
                Selected Program: 
                <span className={`ml-2 font-bold bg-gradient-to-r ${selectedDegreeColor} bg-clip-text text-transparent`}>
                  {selectedDegreeLabel}
                </span>
              </h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Continue to select your semester
              </p>
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${selectedDegreeColor} animate-width-expand origin-left`}></div>
        </div>
      )}
    </div>
    
    {selectedDegree && (
      <div className="mt-4 relative overflow-hidden">
        <Button
          type="button"
          onClick={onNext}
          className="w-full h-12 rounded-lg text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-100 shadow-md hover:shadow-lg relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center">
            Continue to Semester Selection
            <ChevronRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={18} />
          </span>
        </Button>
      </div>
    )}
  </div>
);

interface SemesterSelectionStepProps {
  selectedDegree: string;
  selectedDegreeColor: string;
  selectedDegreeEmoji: string;
  onNext: (semester: number | null) => void;
  onBack: () => void;
}

const SemesterSelectionStep = ({ 
  selectedDegree, 
  selectedDegreeColor, 
  selectedDegreeEmoji, 
  onNext,
  onBack
}: SemesterSelectionStepProps) => {
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const semesters = selectedDegree ? Object.keys(subjectsByDegreeAndSemester[selectedDegree] || {}).map(Number) : [];
  
  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      <div className="space-y-6 flex-1">
        <div>
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3 transition-all duration-300 hover:scale-105 group">
                <BookOpen className="text-indigo-600 dark:text-indigo-400 group-hover:animate-pulse" size={18} />
              </div>
              <span>Select Your Semester</span>
            </h3>
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
              Optional
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
            {semesters.map((semester) => (
              <div 
                key={semester}
                className={`border rounded-lg p-4 transition-all duration-300 ease-in-out flex flex-col items-center group relative overflow-hidden cursor-pointer ${
                  selectedSemester === semester
                    ? `border-blue-500 bg-gradient-to-r ${selectedDegreeColor}/10 shadow-sm ring-1 ring-blue-400 ring-opacity-50`
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                } hover:shadow-md hover:-translate-y-0.5`}
                onClick={() => setSelectedSemester(semester)}
              >
                <div className="text-3xl mb-2">📚</div>
                <h4 className="font-medium text-center">
                  Semester {semester}
                </h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                  {subjectsByDegreeAndSemester[selectedDegree]?.[semester]?.length || 0} subjects
                </p>
                
                {selectedSemester === semester && (
                  <div className="absolute top-2 right-2 text-blue-500">
                    <CheckCircle size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => onNext(null)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Skip semester selection and show all subjects
            </Button>
          </div>
        </div>
        
        {selectedSemester !== null && (
          <div className={`bg-gradient-to-r ${selectedDegreeColor}/10 rounded-lg p-4 mt-auto animate-fade-in-up border border-transparent transition-all duration-700 relative overflow-hidden`}>
            <div className="flex items-center">
              <span className="text-3xl mr-3">{selectedDegreeEmoji}</span>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-white">
                  Selected Semester: 
                  <span className={`ml-2 font-bold bg-gradient-to-r ${selectedDegreeColor} bg-clip-text text-transparent`}>
                    Semester {selectedSemester}
                  </span>
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Continue to select your subjects
                </p>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${selectedDegreeColor} animate-width-expand origin-left`}></div>
          </div>
        )}
      </div>
      
      <div className="flex gap-3 mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12 rounded-lg text-base font-medium border-gray-300 dark:border-gray-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-100 hover:border-blue-300 dark:hover:border-blue-700 relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center">
            <ChevronLeft className="mr-2 transition-transform duration-300 group-hover:-translate-x-1" size={18} />
            Back to Program
          </span>
        </Button>
        <Button
          type="button"
          disabled={!selectedSemester}
          onClick={() => onNext(selectedSemester)}
          className="flex-1 h-12 rounded-lg text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-100 shadow-md hover:shadow-lg relative overflow-hidden"
        >
          <span className="relative z-10 flex items-center justify-center">
            Continue to Subject Selection
            <ChevronRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={18} />
          </span>
        </Button>
      </div>
    </div>
  );
};

interface SubjectsSelectionStepProps {
  form: any;
  selectedDegree: string;
  selectedDegreeColor: string;
  selectedDegreeEmoji: string;
  selectedSubjects: string[];
  availableSubjects: string[];
  setupMutation: any;
  onBack: () => void;
  onSubmit: () => void;
}

const SubjectsSelectionStep = ({
  form,
  selectedDegree,
  selectedDegreeColor,
  selectedDegreeEmoji,
  selectedSubjects,
  availableSubjects,
  setupMutation,
  onBack,
  onSubmit
}: SubjectsSelectionStepProps) => (
  <div className="flex-1 flex flex-col animate-fade-in">
    <div className="space-y-6 flex-1">
      <div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg mr-3 transition-all duration-300 hover:scale-105 group">
              <BookOpen className="text-indigo-600 dark:text-indigo-400 group-hover:animate-pulse" size={18} />
            </div>
            <span>Select Your Subjects</span>
          </h3>
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full transition-all duration-300 animate-pulse group-hover:animate-none">
            {selectedSubjects.length} selected
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto p-1">
          {availableSubjects.map((subject, index) => {
            const [code, ...nameParts] = subject.split(' - ');
            const name = nameParts.join(' - ');
            const emoji = getEmojiForSubject(subject);
            
            return (
              <div 
                key={subject}
                className={`border rounded-lg p-4 transition-all duration-300 ease-in-out flex items-start group relative overflow-hidden ${
                  selectedSubjects.includes(subject)
                    ? `border-blue-500 bg-gradient-to-r ${selectedDegreeColor}/10 shadow-sm ring-1 ring-blue-400 ring-opacity-50`
                    : "border-gray-200 dark:border-gray-700 hover:border-blue-300"
                } hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="text-2xl mr-3 flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100/50 dark:bg-gray-800/50">
                  {emoji}
                </div>
                
                <FormField
                  control={form.control}
                  name="subjects"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 w-full relative z-10">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(subject)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, subject])
                              : field.onChange(
                                  field.value?.filter(value => value !== subject)
                                )
                          }}
                          className="mt-0.5 h-5 w-5 rounded-md data-[state=checked]:bg-blue-600 transition-colors duration-200"
                        />
                      </FormControl>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <FormLabel className="text-sm font-medium text-gray-800 dark:text-white cursor-pointer group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {code}
                          </FormLabel>
                          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded transition-all duration-300 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50">
                            {selectedDegree}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors">
                          {name}
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
                
                {selectedSubjects.includes(subject) && (
                  <div className="absolute top-2 right-2 text-blue-500 animate-tick">
                    <CheckCircle size={18} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {form.formState.errors.subjects && (
          <p className="text-red-500 text-sm font-medium mt-2 text-center animate-pulse">
            {form.formState.errors.subjects.message}
          </p>
        )}
      </div>
      
      {selectedSubjects.length > 0 && (
        <div className={`bg-gradient-to-r ${selectedDegreeColor}/10 rounded-lg p-4 mt-auto animate-fade-in-up border border-transparent transition-all duration-700 relative overflow-hidden`}>
          <div className="flex items-center">
            <span className="text-3xl mr-3">{selectedDegreeEmoji}</span>
            <div>
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-gray-800 dark:text-white">
                  Ready to complete your profile setup
                </h4>
                <span className={`text-sm font-medium bg-gradient-to-r ${selectedDegreeColor} bg-clip-text text-transparent animate-bounce`}>
                  {selectedSubjects.length} subjects selected
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                You've selected subjects for your {selectedDegree} program.
              </p>
            </div>
          </div>
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${selectedDegreeColor} animate-width-expand origin-left`}></div>
        </div>
      )}
    </div>
    
    <div className="flex gap-3 mt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="flex-1 h-12 rounded-lg text-base font-medium border-gray-300 dark:border-gray-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-100 hover:border-blue-300 dark:hover:border-blue-700 relative overflow-hidden"
      >
        <span className="relative z-10 flex items-center justify-center">
          <ChevronLeft className="mr-2 transition-transform duration-300 group-hover:-translate-x-1" size={18} />
          Back to Semester
        </span>
      </Button>
      <Button
        type="submit"
        disabled={setupMutation.isPending}
        onClick={onSubmit}
        className="flex-1 h-12 rounded-lg text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-100 shadow-md hover:shadow-lg relative overflow-hidden"
      >
        {setupMutation.isPending ? (
          <span className="flex items-center justify-center relative z-10">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Finalizing...
          </span>
        ) : (
          <span className="relative z-10 flex items-center justify-center">
            <CheckCircle className="mr-2 transition-transform duration-300 group-hover:scale-110" size={18} />
            Complete Setup
          </span>
        )}
      </Button>
    </div>
  </div>
);

// ==================== Main Component ====================
export function SetupProfile({ user }: SetupProfileProps) {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedDegreeLabel, setSelectedDegreeLabel] = useState("");
  const [selectedDegreeColor, setSelectedDegreeColor] = useState("");
  const [selectedDegreeEmoji, setSelectedDegreeEmoji] = useState("");
  const [completedSteps, setCompletedSteps] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [theme, setTheme] = useState<Theme>('light');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const prevStepRef = useRef(step);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      setTheme(prefersDark ? 'dark' : 'light');
    }
  }, []);

  // Apply theme
  useEffect(() => {
    if (theme === 'transparent') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Cycle through themes
  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'transparent';
      return 'light';
    });
  };

  const form = useForm<SetupData>({
    resolver: zodResolver(setupSchema),
    defaultValues: {
      degreeProgram: "",
      subjects: [],
    },
  });

  const selectedDegree = form.watch("degreeProgram");
  const selectedSubjects = form.watch("subjects") || [];
  const availableSubjects = getAvailableSubjects(selectedDegree, selectedSemester);

  // Update progress based on user actions
  useEffect(() => {
    let newProgress = 0;
    let stepsCompleted = 0;
    
    if (selectedDegree) {
      stepsCompleted = 1;
      newProgress = 33;
    }
    
    if (selectedSemester !== null || (step > 2 && selectedDegree)) {
      stepsCompleted = 2;
      newProgress = 66;
    }
    
    if (selectedSubjects.length > 0) {
      stepsCompleted = 3;
      newProgress = 100;
    }
    
    setCompletedSteps(stepsCompleted);
    setProgress(newProgress);
  }, [selectedDegree, selectedSemester, selectedSubjects, step]);

  useEffect(() => {
    // Store previous step for animation direction
    prevStepRef.current = step;
  }, [step]);

  useEffect(() => {
    // Update selected degree label and color
    if (selectedDegree) {
      const degree = degreePrograms.find(d => d.value === selectedDegree);
      if (degree) {
        setSelectedDegreeLabel(degree.label);
        setSelectedDegreeColor(degree.color);
        setSelectedDegreeEmoji(degree.emoji);
      }
    }
  }, [selectedDegree]);

  const setupMutation = useMutation({
    mutationFn: async (data: SetupData) => {
      const response = await apiRequest("POST", "/api/user/setup-profile", data);
      return response.json();
    },
    onSuccess: () => {
      setShowSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "⚠️ Setup Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SetupData) => {
    setupMutation.mutate(data);
  };

  const handleSemesterSelect = (semester: number | null) => {
    setSelectedSemester(semester);
    setStep(3);
  };

  if (showSuccess) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        theme === 'transparent'
          ? 'bg-gradient-to-br from-blue-50/50 to-indigo-100/50 dark:from-gray-900/50 dark:to-gray-800/50'
          : theme === 'dark'
            ? 'bg-gradient-to-br from-gray-900 to-gray-800'
            : 'bg-gradient-to-br from-blue-50 to-indigo-100'
      }`}>
        <div className={`w-full max-w-2xl shadow-2xl rounded-2xl overflow-hidden p-8 text-center ${
          theme === 'transparent'
            ? 'bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl'
            : theme === 'dark'
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white border border-gray-200'
        }`}>
          <div className="flex flex-col items-center justify-center">
            <div className={`p-6 rounded-full mb-6 animate-scale-in ${
              theme === 'transparent'
                ? 'bg-green-100/70 dark:bg-green-900/20 backdrop-blur-sm'
                : theme === 'dark'
                  ? 'bg-green-900/20'
                  : 'bg-green-100'
            }`}>
              <CheckCircle className="text-green-600 dark:text-green-400" size={60} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 animate-fade-in">
              🎉 Congratulations!
            </h1>
            
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent text-5xl font-extrabold mb-6 animate-text-gradient">
              Welcome to VU Portal
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mb-8 animate-fade-in delay-300">
              Your profile setup is complete. You can now access all features of the student portal and start your academic journey!
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md mb-8">
              <div className={`p-4 rounded-lg text-center animate-fade-in-up delay-500 ${
                theme === 'transparent'
                  ? 'bg-blue-50/70 dark:bg-gray-800/70 backdrop-blur-sm'
                  : theme === 'dark'
                    ? 'bg-gray-800'
                    : 'bg-blue-50'
              }`}>
                <div className="text-3xl mb-2">{selectedDegreeEmoji}</div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Degree Program</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedDegreeLabel}</p>
              </div>
              
              <div className={`p-4 rounded-lg text-center animate-fade-in-up delay-700 ${
                theme === 'transparent'
                  ? 'bg-blue-50/70 dark:bg-gray-800/70 backdrop-blur-sm'
                  : theme === 'dark'
                    ? 'bg-gray-800'
                    : 'bg-blue-50'
              }`}>
                <div className="text-3xl mb-2">📚</div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Subjects Selected</h3>
                <p className="text-gray-600 dark:text-gray-300">{selectedSubjects.length} subjects</p>
              </div>
            </div>
            
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 h-12 px-8 rounded-lg text-base font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-100 shadow-md hover:shadow-lg"
            >
              Get Started
              <ChevronRight className="ml-2" size={18} />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${
      theme === 'transparent'
        ? 'bg-gradient-to-br from-blue-50/50 to-indigo-100/50 dark:from-gray-900/50 dark:to-gray-800/50'
        : theme === 'dark'
          ? 'bg-gradient-to-br from-gray-900 to-gray-800'
          : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      {/* Theme toggle button */}
      <button
        onClick={cycleTheme}
        className={`absolute top-4 right-4 z-50 p-3 rounded-full shadow-lg hover:scale-110 transition-transform duration-300 flex items-center justify-center ${
          theme === 'transparent'
            ? 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-md'
            : theme === 'dark'
              ? 'bg-gray-800'
              : 'bg-white'
        }`}
        aria-label="Toggle theme"
      >
        {theme === 'transparent' ? (
          <Monitor className="text-indigo-600" size={20} />
        ) : theme === 'dark' ? (
          <Moon className="text-blue-400" size={20} />
        ) : (
          <Sun className="text-yellow-500" size={20} />
        )}
      </button>
      
      {/* Animated background elements - only visible in transparent mode */}
      {theme === 'transparent' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full opacity-10 animate-float"
              style={{
                background: `conic-gradient(from 90deg at 50% 50%, ${i % 2 === 0 ? '#3b82f6' : '#8b5cf6'}, transparent)`,
                width: `${Math.random() * 100 + 100}px`,
                height: `${Math.random() * 100 + 100}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 20 + 20}s`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
      )}
      
      <div 
        ref={containerRef}
        className={`w-full max-w-8xl shadow-2xl rounded-2xl overflow-hidden flex flex-col lg:flex-row transition-all duration-500 hover:shadow-2xl ${
          theme === 'transparent'
            ? 'bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-800/50 backdrop-blur-xl'
            : theme === 'dark'
              ? 'bg-gray-900 border border-gray-800'
              : 'bg-white border border-gray-200'
        }`}
      >
        <UniversityInfoPanel theme={theme} />
        
        {/* Setup Form Panel */}
        <div className={`w-full lg:w-[60%] p-6 flex flex-col ${
          theme === 'transparent'
          ? 'bg-transparent'
            // ? 'bg-white/50 dark:bg-gray-900/50 backdrop-blur-md'
            : theme === 'dark'
              ? 'bg-gray-900'
              : 'bg-white'
        }`}>
          <CardHeader className="px-0 pt-0">
            <div className="flex items-center justify-between mb-6">
              <div className="animate-fade-in">
                <CardTitle className="text-xl text-gray-800 dark:text-white">Complete Your Profile</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                  Personalize your academic experience in just 3 steps
                </CardDescription>
              </div>
              <div className={`p-3 rounded-xl transition-all duration-300 hover:rotate-6 group ${
                theme === 'transparent'
                  ? 'bg-blue-100/70 dark:bg-blue-900/30 backdrop-blur-sm'
                  : theme === 'dark'
                    ? 'bg-blue-900/30'
                    : 'bg-blue-100'
              }`}>
                <GraduationCap className="text-blue-600 dark:text-blue-400 transition-transform duration-700 group-hover:rotate-[360deg]" size={24} />
              </div>
            </div>
            
            <SetupProgress 
              step={step}
              completedSteps={completedSteps}
              selectedDegreeColor={selectedDegreeColor}
              progress={progress}
            />
          </CardHeader>

          <CardContent className="px-0 pb-0 flex-1">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="h-full flex flex-col">
                {/* Step 1: Degree Program */}
                {step === 1 && (
                  <DegreeSelectionStep 
                    form={form}
                    selectedDegree={selectedDegree}
                    selectedDegreeLabel={selectedDegreeLabel}
                    selectedDegreeColor={selectedDegreeColor}
                    selectedDegreeEmoji={selectedDegreeEmoji}
                    onNext={() => setStep(2)}
                  />
                )}

                {/* Step 2: Semester Selection */}
                {step === 2 && (
                  <SemesterSelectionStep 
                    selectedDegree={selectedDegree}
                    selectedDegreeColor={selectedDegreeColor}
                    selectedDegreeEmoji={selectedDegreeEmoji}
                    onNext={handleSemesterSelect}
                    onBack={() => setStep(1)}
                  />
                )}

                {/* Step 3: Subjects Selection */}
                {step === 3 && (
                  <SubjectsSelectionStep 
                    form={form}
                    selectedDegree={selectedDegree}
                    selectedDegreeColor={selectedDegreeColor}
                    selectedDegreeEmoji={selectedDegreeEmoji}
                    selectedSubjects={selectedSubjects}
                    availableSubjects={availableSubjects}
                    setupMutation={setupMutation}
                    onBack={() => setStep(2)}
                    onSubmit={() => form.handleSubmit(onSubmit)}
                  />
                )}
              </form>
            </Form>
          </CardContent>
        </div>
      </div>
      
      {/* Global animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0;
            transform: translateY(10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from { 
            opacity: 0;
            transform: translateX(-20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInRight {
          from { 
            opacity: 0;
            transform: translateX(20px);
          }
          to { 
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes float {
          0% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes progressPulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.7; }
          100% { opacity: 0.3; }
        }
        
        @keyframes bounceHorizontal {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        
        @keyframes widthExpand {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        
        @keyframes tick {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes textGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-in-out;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }
        
        .animate-fade-in-left {
          animation: fadeInLeft 0.5s ease-out;
        }
        
        .animate-fade-in-right {
          animation: fadeInRight 0.5s ease-out;
        }
        
        .animate-float {
          animation: float 12s ease-in-out infinite;
        }
        
        .animate-rotate-slow {
          animation: rotate 30s linear infinite;
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s infinite;
        }
        
        .animate-progress-pulse {
          animation: progressPulse 2s infinite;
        }
        
        .animate-bounce-horizontal {
          animation: bounceHorizontal 1.5s infinite;
        }
        
        .animate-width-expand {
          animation: widthExpand 0.7s ease-out forwards;
        }
        
        .animate-tick {
          animation: tick 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .animate-text-gradient {
          background-size: 200% auto;
          animation: textGradient 3s linear infinite;
        }
        
        .delay-100 {
          animation-delay: 100ms;
        }
      `}</style>
    </div>
  );
}
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { z } from "zod";
// import { GraduationCap, BookOpen, CheckCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { useToast } from "@/hooks/use-toast";
// import { apiRequest } from "@/lib/queryClient";

// const setupSchema = z.object({
//   degreeProgram: z.string().min(1, "Please select your degree program"),
//   subjects: z.array(z.string()).min(1, "Please select at least one subject"),
// });

// type SetupData = z.infer<typeof setupSchema>;

// interface SetupProfileProps {
//   user: any;
// }

// const degreePrograms = [
//   { value: "BSCS", label: "BS Computer Science" },
//   { value: "BSIT", label: "BS Information Technology" },
//   { value: "BSSE", label: "BS Software Engineering" },
//   { value: "MCS", label: "MS Computer Science" },
//   { value: "MIT", label: "MS Information Technology" },
//   { value: "MBA", label: "Master of Business Administration" },
//   { value: "BBA", label: "Bachelor of Business Administration" },
//   { value: "BSPHY", label: "BS Physics" },
//   { value: "BSMATH", label: "BS Mathematics" },
// ];

// const subjectsByDegree: Record<string, string[]> = {
//   BSCS: [
//     "CS201 - Introduction to Programming",
//     "CS301 - Data Structures",
//     "CS401 - Computer Architecture",
//     "CS501 - Software Engineering",
//     "MTH601 - Operations Research",
//     "MTH632 - Differential Equations",
//     "STA630 - Research Methods",
//   ],
//   BSIT: [
//     "CS201 - Introduction to Programming",
//     "CS301 - Data Structures", 
//     "IT430 - E-Commerce",
//     "IT630 - Knowledge Management",
//     "STA630 - Research Methods",
//   ],
//   BSSE: [
//     "CS201 - Introduction to Programming",
//     "CS301 - Data Structures",
//     "CS501 - Software Engineering",
//     "CS506 - Web Design and Development",
//     "SWE622 - Software Project Management",
//   ],
//   MCS: [
//     "CS701 - Advanced Computer Architecture",
//     "CS702 - Advanced Algorithms",
//     "CS703 - Advanced Database Systems",
//     "STA630 - Research Methods",
//   ],
//   // Add more degree-specific subjects as needed
// };

// export function SetupProfile({ user }: SetupProfileProps) {
//   const [step, setStep] = useState(1);
//   const { toast } = useToast();
//   const queryClient = useQueryClient();

//   const form = useForm<SetupData>({
//     resolver: zodResolver(setupSchema),
//     defaultValues: {
//       degreeProgram: "",
//       subjects: [],
//     },
//   });

//   const selectedDegree = form.watch("degreeProgram");
//   const availableSubjects = selectedDegree ? subjectsByDegree[selectedDegree] || [] : [];

//   const setupMutation = useMutation({
//     mutationFn: async (data: SetupData) => {
//       const response = await apiRequest("POST", "/api/user/setup-profile", data);
//       return response.json();
//     },
//     onSuccess: () => {
//       toast({
//         title: "Profile Setup Complete",
//         description: "Welcome to VU Portal! You can now access all features.",
//       });
//       // Invalidate and refetch user data
//       queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
//     },
//     onError: (error: Error) => {
//       toast({
//         title: "Setup Failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   const onSubmit = (data: SetupData) => {
//     setupMutation.mutate(data);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
//       <Card className="w-full max-w-2xl">
//         <CardHeader className="text-center">
//           <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
//             <GraduationCap className="text-blue-600 dark:text-blue-400" size={32} />
//           </div>
//           <CardTitle className="text-2xl">Welcome to VU Portal!</CardTitle>
//           <CardDescription>
//             Let's set up your profile to personalize your experience
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//               {/* Step 1: Degree Program */}
//               <div className={`transition-opacity duration-300 ${step === 1 ? 'opacity-100' : 'opacity-50'}`}>
//                 <FormField
//                   control={form.control}
//                   name="degreeProgram"
//                   render={({ field }) => (
//                     <FormItem>
//                       <FormLabel className="text-lg font-semibold">
//                         🎓 Select Your Degree Program
//                       </FormLabel>
//                       <FormControl>
//                         <Select onValueChange={field.onChange} defaultValue={field.value}>
//                           <SelectTrigger className="h-12">
//                             <SelectValue placeholder="Choose your degree program" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             {degreePrograms.map((degree) => (
//                               <SelectItem key={degree.value} value={degree.value}>
//                                 {degree.label}
//                               </SelectItem>
//                             ))}
//                           </SelectContent>
//                         </Select>
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )}
//                 />

//                 {selectedDegree && (
//                   <div className="mt-6">
//                     <Button
//                       type="button"
//                       onClick={() => setStep(2)}
//                       className="w-full"
//                       size="lg"
//                     >
//                       Next: Select Subjects
//                     </Button>
//                   </div>
//                 )}
//               </div>

//               {/* Step 2: Subjects */}
//               {selectedDegree && (
//                 <div className={`transition-opacity duration-300 ${step === 2 ? 'opacity-100' : 'opacity-50'}`}>
//                   <FormField
//                     control={form.control}
//                     name="subjects"
//                     render={() => (
//                       <FormItem>
//                         <FormLabel className="text-lg font-semibold flex items-center">
//                           <BookOpen className="mr-2" size={20} />
//                           📚 Select Your Subjects
//                         </FormLabel>
//                         <FormControl>
//                           <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto p-4 border rounded-lg">
//                             {availableSubjects.map((subject) => (
//                               <FormField
//                                 key={subject}
//                                 control={form.control}
//                                 name="subjects"
//                                 render={({ field }) => (
//                                   <FormItem className="flex flex-row items-start space-x-3 space-y-0">
//                                     <FormControl>
//                                       <Checkbox
//                                         checked={field.value?.includes(subject)}
//                                         onCheckedChange={(checked) => {
//                                           const updatedValues = checked
//                                             ? [...(field.value || []), subject]
//                                             : field.value?.filter((value) => value !== subject) || [];
//                                           field.onChange(updatedValues);
//                                         }}
//                                       />
//                                     </FormControl>
//                                     <FormLabel className="text-sm font-normal cursor-pointer">
//                                       {subject}
//                                     </FormLabel>
//                                   </FormItem>
//                                 )}
//                               />
//                             ))}
//                           </div>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <div className="flex gap-3 mt-6">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => setStep(1)}
//                       className="flex-1"
//                     >
//                       Back
//                     </Button>
//                     <Button
//                       type="submit"
//                       disabled={setupMutation.isPending}
//                       className="flex-1"
//                       size="lg"
//                     >
//                       {setupMutation.isPending ? (
//                         "Setting up..."
//                       ) : (
//                         <>
//                           <CheckCircle className="mr-2" size={20} />
//                           Complete Setup
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 </div>
//               )}
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


// $env:PORT=5001; npx tsx server/index.ts



