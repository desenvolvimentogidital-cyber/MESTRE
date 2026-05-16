
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, User as UserIcon, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { useStore } from '../store/useStore';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { AppointmentForm } from './forms/AppointmentForm';

export function Agenda() {
  const { osList, clients } = useStore();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente';

  const dayAppointments = osList.filter(os => {
    if (!date) return false;
    return os.scheduledDate === date.toISOString().split('T')[0];
  });

  const handleNewAppointment = () => {
    setIsFormOpen(true);
  };


  const handlePrevDay = () => {
    if (date) {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() - 1);
      setDate(newDate);
    }
  };

  const handleNextDay = () => {
    if (date) {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + 1);
      setDate(newDate);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
          <p className="text-muted-foreground">Planeje seus horários e serviços.</p>
        </div>
        <Button onClick={handleNewAppointment} className="bg-primary text-primary-foreground font-bold flex items-center gap-2 shadow-[0_4px_20px_rgba(250,204,21,0.2)] hover:bg-primary/90">
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <div className="space-y-4">
           <Card className="bg-card border-primary/10 h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle className="text-lg">Compromissos do Dia</CardTitle>
                 <div className="flex gap-2">
                    <Button onClick={handlePrevDay} variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
                    <Button onClick={handleNextDay} variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
                 </div>
              </CardHeader>
              <CardContent className="space-y-6">
                 {dayAppointments.map((os) => (
                    <div key={os.id} className="flex gap-4 p-4 rounded-xl border border-primary/5 bg-secondary/20 hover:bg-secondary/40 transition-colors border-l-4 border-l-primary">
                       <div className="min-w-[70px] flex flex-col items-center justify-center border-r border-primary/10 pr-4">
                          <span className="text-xl font-bold text-primary">{os.scheduledTime}</span>
                          <span className="text-[10px] uppercase text-muted-foreground">Horário</span>
                       </div>
                       <div className="flex-1 space-y-2">
                         <div className="flex justify-between items-start">
                            <h4 className="font-bold text-white">{os.description}</h4>
                            <Badge variant="outline" className="text-[10px] uppercase">{os.status}</Badge>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                               <UserIcon className="h-3 w-3 text-primary" />
                               <span>{getClientName(os.clientId)}</span>
                            </div>
                            {os.location && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                 <MapPin className="h-3 w-3 text-primary" />
                                 <span>{os.location}</span>
                              </div>
                            )}
                         </div>
                       </div>
                    </div>
                 ))}
                 
                 {dayAppointments.length === 0 && (

                    <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
                       <Clock className="w-12 h-12 opacity-10" />
                       <p>Nenhum compromisso para este dia.</p>
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

        <div className="space-y-4">
           <Card className="bg-card border-primary/10">
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border-none"
                  classNames={{
                    selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    today: "bg-accent text-accent-foreground",
                  }}
                />
              </CardContent>
           </Card>
           
           <Card className="bg-card border-primary/10">
              <CardHeader>
                <CardTitle className="text-sm">Estatísticas Semanais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                       <span>Serviços Concluídos</span>
                       <span className="font-bold">12/15</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[80%]" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                       <span>Orçamentos Enviados</span>
                       <span className="font-bold">8/10</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                       <div className="h-full bg-primary w-[60%]" />
                    </div>
                 </div>
              </CardContent>
           </Card>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Novo Agendamento
            </DialogTitle>
          </DialogHeader>
          <AppointmentForm 
            onSuccess={() => setIsFormOpen(false)} 
            initialDate={date}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

