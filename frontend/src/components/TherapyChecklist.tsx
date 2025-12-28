import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export default function TherapyChecklist() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Morning stretches', completed: true },
    { id: '2', title: 'Balance exercises', completed: true },
    { id: '3', title: 'Speech practice', completed: false },
    { id: '4', title: 'Memory games', completed: false },
    { id: '5', title: 'Evening meditation', completed: false },
  ]);

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progress = (completedCount / totalCount) * 100;

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Daily Checklist
        </CardTitle>
        <CardDescription>
          {completedCount} of {totalCount} tasks completed
        </CardDescription>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors">
              <Checkbox
                id={task.id}
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
              />
              <label
                htmlFor={task.id}
                className={`flex-1 cursor-pointer ${
                  task.completed ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {task.title}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}