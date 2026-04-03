import { useState } from "react";
import { useNavigate } from "react-router";
import { Brain, ArrowRight, Database, Monitor, Cpu, Server, Layers } from "lucide-react";

// Our structure based on database schema
const subjects = [
  {
    id: 1,
    name: "Data Structures & Algorithms",
    icon: <Layers className="w-6 h-6 text-[#6366f1]" />,
    color: "from-[#6366f1]/10 to-[#6366f1]/5",
    border: "border-[#6366f1]/20",
    topics: [
      { id: 1, name: "Arrays" },
      { id: 2, name: "Sliding Window" },
      { id: 3, name: "Binary Search" },
      { id: 4, name: "Dynamic Programming" }
    ]
  },
  {
    id: 2,
    name: "Operating Systems",
    icon: <Cpu className="w-6 h-6 text-[#f59e0b]" />,
    color: "from-[#f59e0b]/10 to-[#f59e0b]/5",
    border: "border-[#f59e0b]/20",
    topics: [
      { id: 5, name: "Processes & Threads" },
      { id: 6, name: "CPU Scheduling" },
      { id: 7, name: "Deadlocks" }
    ]
  },
  {
    id: 3,
    name: "DBMS",
    icon: <Database className="w-6 h-6 text-[#22c55e]" />,
    color: "from-[#22c55e]/10 to-[#22c55e]/5",
    border: "border-[#22c55e]/20",
    topics: [
      { id: 8, name: "Normalization" },
      { id: 9, name: "Indexing" },
      { id: 10, name: "Transactions & ACID" }
    ]
  },
  {
    id: 4,
    name: "System Design",
    icon: <Server className="w-6 h-6 text-[#ec4899]" />,
    color: "from-[#ec4899]/10 to-[#ec4899]/5",
    border: "border-[#ec4899]/20",
    topics: [
      { id: 11, name: "Scalability Basics" },
      { id: 12, name: "Load Balancing" },
      { id: 13, name: "Caching" }
    ]
  },
  {
    id: 5,
    name: "Artificial Intelligence",
    icon: <Monitor className="w-6 h-6 text-[#8b5cf6]" />,
    color: "from-[#8b5cf6]/10 to-[#8b5cf6]/5",
    border: "border-[#8b5cf6]/20",
    topics: [
      { id: 14, name: "Linear Regression" },
      { id: 15, name: "Classification" },
      { id: 16, name: "Neural Networks" }
    ]
  }
];

export function QuizTopicSelect() {
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState(subjects[0].id);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);

  const activeSubject = subjects.find(s => s.id === selectedSubject);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-brand/10 rounded-xl">
           <Brain className="w-8 h-8 text-brand" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Select a Quiz Topic</h1>
          <p className="text-muted-foreground mt-1">Choose a subject and topic to test your knowledge.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
         {/* Sidebar Subjects */}
         <div className="md:col-span-1 space-y-3">
            <h3 className="font-semibold text-lg text-foreground mb-4">Subjects</h3>
            {subjects.map(subject => (
               <button
                 key={subject.id}
                 onClick={() => setSelectedSubject(subject.id)}
                 className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                   subject.id === selectedSubject 
                     ? `border-brand bg-brand/10 shadow-sm` 
                     : `border-border bg-card hover:border-brand/40`
                 }`}
               >
                 {subject.icon}
                 <span className="font-medium text-foreground">{subject.name}</span>
               </button>
            ))}
         </div>

         {/* Topics Grid */}
         <div className="md:col-span-3">
            <div className="flex items-center justify-between mb-4">
               <h3 className="font-semibold text-lg text-foreground">Available Topics</h3>
               {selectedTopics.length > 0 && (
                  <button 
                    onClick={() => navigate(`/app/quiz?topic_id=${selectedTopics.join(',')}`)}
                    className="px-4 py-2 bg-gradient-to-r from-brand to-purple-500 text-white font-bold rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all text-sm flex items-center gap-2"
                  >
                    Start Mixed Quiz ({selectedTopics.length}) <ArrowRight className="w-4 h-4" />
                  </button>
               )}
            </div>
            {activeSubject && (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeSubject.topics.map(topic => {
                     const isSelected = selectedTopics.includes(topic.id);
                     return (
                     <button
                        key={topic.id}
                        onClick={() => {
                           if (isSelected) {
                              setSelectedTopics(prev => prev.filter(id => id !== topic.id));
                           } else {
                              setSelectedTopics(prev => [...prev, topic.id]);
                           }
                        }}
                        className={`p-6 border rounded-xl text-left hover:scale-105 hover:shadow-md transition-all group flex flex-col justify-between h-36 relative ${isSelected ? `bg-gradient-to-br ${activeSubject.color} border-brand shadow-sm` : 'bg-card border-border hover:border-brand/40'}`}
                     >
                        {isSelected && (
                           <div className="absolute top-3 right-3 w-5 h-5 bg-brand rounded-full flex items-center justify-center text-white shadow-sm">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                           </div>
                        )}
                        <h4 className={`font-bold text-lg leading-tight transition-colors pr-6 ${isSelected ? 'text-brand' : 'text-foreground group-hover:text-brand'}`}>{topic.name}</h4>
                        
                        {/* Singular Start Button */}
                        <div 
                           onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/app/quiz?topic_id=${topic.id}`);
                           }}
                           className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-brand transition-all cursor-pointer mt-4"
                        >
                           Start Topic <ArrowRight className="w-4 h-4 ml-auto" />
                        </div>
                     </button>
                  )})}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
