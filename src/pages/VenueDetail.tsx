import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useVenue } from '@/hooks/use-venues';
import { useCreateBooking } from '@/hooks/use-bookings';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import SportyFiHeader from '@/components/SportyFiHeader';
import Footer from '@/components/Footer';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  IndianRupee,
  Info,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import TimelineBooking from './TimelineBooking';

const bookingFormSchema = z.object({
  bookingDate: z.date({
    required_error: "Please select a date for your booking",
  }),
  startTime: z.string({
    required_error: "Please select a start time",
  }),
  endTime: z.string({
    required_error: "Please select an end time",
  }).refine(val => val !== '', {
    message: "Please select an end time",
  }),
  notes: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "You must accept Terms & Conditions",
  }),
}).refine(data => {
  const [sh, sm] = data.startTime.split(':').map(Number);
  const [eh, em] = data.endTime.split(':').map(Number);
  const startMinutes = sh * 60 + (sm || 0);
  const endMinutes = eh * 60 + (em || 0);
  return endMinutes > startMinutes;
}, {
  message: "End time must be after start time",
  path: ["endTime"]
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookedSlot {
  startTime: string; // "16:10:00"
  endTime: string;   // "18:30:00"
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const VenueDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [bookedSlots, setBookedSlots] = useState<BookedSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Image gallery
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Booking dialog
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Get venue data
  const { data: venue, isLoading, error } = useVenue(id);

  // Create booking mutation
  const { mutate: createBooking, isPending: isBookingPending } = useCreateBooking();

  // Form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      notes: '',
      termsAccepted: false,
      startTime: '',
      endTime: '',
      bookingDate: undefined as any,
    },
  });

  // 24-hour times with 30-min step (HH:mm:ss)
  // const times: string[] = [];
  // for (let h = 0; h < 24; h++) {
  //   for (let m = 0; m < 60; m += 30) {
  //     times.push(`${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:00`);
  //   }
  // }
  // Utility: format Date -> YYYY-MM-DD (local, avoids UTC shift)
  const formatLocalDate = (d: Date) => d.toLocaleDateString('en-CA');

  // Check overlap between two intervals (aStart < bEnd && aEnd > bStart)
  const overlaps = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
    return aStart < bEnd && aEnd > bStart;
  };

  // Check if a single time point (HH:mm:ss) is within any booked slot
  const isTimeBooked = (time: string) => {
    return bookedSlots.some(slot => overlaps(time, incrementTime(time, 1), slot.startTime, slot.endTime));
  };

  // Increment time by minutes (returns HH:mm:ss)
  function incrementTime(time: string, minutes: number) {
    const [h, m, s] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    const nh = Math.floor(total / 60) % 24;
    const nm = total % 60;
    return `${nh.toString().padStart(2,'0')}:${nm.toString().padStart(2,'0')}:00`;
  }

  // Check whole selected range (start..end) is free (no overlap with booked slots)
  const isRangeFree = (start: string, end: string) => {
    return !bookedSlots.some(bs => overlaps(start, end, bs.startTime, bs.endTime));
  };

  // Sync selectedDate into form.bookingDate and fetch booked slots
  useEffect(() => {
    form.setValue('startTime', '');
    form.setValue('endTime', '');
    form.setValue('bookingDate', selectedDate || (undefined as any));
    setBookedSlots([]);

    if (!selectedDate || !id) return;

    const dateStr = formatLocalDate(selectedDate);
    const controller = new AbortController();

    // fetch booked slots for this venue & date
    fetch(`${API_BASE_URL}/sportyfi/${id}/booked-slots?date=${dateStr}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.message || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data: BookedSlot[]) => {
        // backend expected format: [{startTime:"16:10:00", endTime:"18:30:00"}, ...]
        setBookedSlots(data || []);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        console.error('Failed to load booked slots', err);
        toast({
          title: 'Could not load availability',
          description: err.message || 'Something went wrong',
          variant: 'destructive',
        });
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, id]);

  // Handle clicking a time cell: implement simple range selection
  const onTimeClick = (time: string) => {
    // ignore clicks on booked time
    if (isTimeBooked(time)) return;

    const currentStart = form.getValues('startTime');
    const currentEnd = form.getValues('endTime');

    // If no start set -> set start
    if (!currentStart) {
      form.setValue('startTime', time);
      form.setValue('endTime', '');
      return;
    }

    // If start set and no end -> if clicked time > start, set end; else set new start
    if (currentStart && !currentEnd) {
      if (time <= currentStart) {
        // choose earlier time as new start
        form.setValue('startTime', time);
        return;
      }
      // Check full range free from currentStart to time+30min
      const rangeEnd = incrementTime(time, 30); // end is exclusive
      if (isRangeFree(currentStart, rangeEnd)) {
        form.setValue('endTime', rangeEnd.slice(0,5) === '00:0' ? rangeEnd : rangeEnd.slice(0,8)); // ensure format
        // store HH:mm:ss (we use full)
        form.setValue('endTime', rangeEnd);
        return;
      } else {
        toast({
          title: 'Slot unavailable',
          description: 'Selected range overlaps an existing booking.',
          variant: 'destructive',
        });
        return;
      }
    }

    // If both start and end set -> start new selection
    form.setValue('startTime', time);
    form.setValue('endTime', '');
  };

  // Submit
  const onSubmit = (values: BookingFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to book this venue',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    if (!id) return;

    // ensure start/end present and range is free
    if (!values.startTime || !values.endTime) {
      toast({
        title: 'Select time range',
        description: 'Please select start and end time for booking.',
        variant: 'destructive',
      });
      return;
    }
    if (!isRangeFree(values.startTime, values.endTime)) {
      toast({
        title: 'Slot not available',
        description: 'The selected time overlaps an existing booking.',
        variant: 'destructive',
      });
      return;
    }

    // create booking (bookingDate is a Date object in form)
    createBooking({
      venueId: id,
      bookingDate: values.bookingDate,
      startTime: values.startTime.slice(0,5), // send "HH:mm"
      endTime: values.endTime.slice(0,5),
      notes: values.notes,
    }, {
      onSuccess: () => {
        setIsBookingOpen(false);
        form.reset();
        setBookedSlots([]); // will be refetched when reopen/select date
        toast({
          title: 'Booking Requested',
          description: 'Booking created with pending status. Proceed to payment.',
        });
      },
      onError: (err: any) => {
        toast({
          title: 'Booking failed',
          description: err?.response?.data?.error || 'Could not create booking',
          variant: 'destructive',
        });
      }
    });
  };

  // Image gallery nav
  const nextImage = () => {
    if (!venue?.images?.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % venue.images.length);
  };
  const prevImage = () => {
    if (!venue?.images?.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + venue.images.length) % venue.images.length);
  };

  const defaultImage = 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1305&q=80';
  const currentImage = venue?.images?.length ? venue.images[currentImageIndex].image_url : defaultImage;

  return (
    <div className="min-h-screen flex flex-col">
      <SportyFiHeader />

      <main className="flex-grow">
        {isLoading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="h-96 bg-gray-200 animate-pulse rounded-lg mb-8"></div>
          </div>
        )}

        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>Failed to load venue details.</AlertDescription>
            </Alert>
            <div className="mt-6">
              <Link to="/venues">
                <Button>
                  <ChevronLeft className="mr-2 h-4 w-4" /> Back to Venues
                </Button>
              </Link>
            </div>
          </div>
        )}

        {venue && (
          <div className="bg-white">
            <div className="relative h-96 md:h-[500px] bg-gray-200">
              <img src={currentImage} alt={venue.name} className="w-full h-full object-cover" />
              {venue.images && venue.images.length > 1 && (
                <>
                  <Button variant="outline" size="icon" className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 rounded-full" onClick={prevImage}>
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" size="icon" className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 rounded-full" onClick={nextImage}>
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold">{venue.name}</h1>
                  <div className="flex items-center text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{venue.location}, {venue.city}</span>
                  </div>
                </div>

                {/* Booking Dialog */}
                <div className="mt-4 md:mt-0">
                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button size="lg" className="bg-sportyfi-orange hover:bg-red-600">Book Now</Button>
                    </DialogTrigger>

                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Book {venue.name}</DialogTitle>
                        <DialogDescription>Select your preferred date and time for booking this venue.</DialogDescription>
                      </DialogHeader>

                      <div className="overflow-y-auto flex-1 pr-1">
                        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">

                            {/* Date Picker */}
                            <div>
                              <FormLabel>Date</FormLabel>
                              <Calendar
                                mode="single"
                                selected={selectedDate || undefined}
                                onSelect={(date) => setSelectedDate(date || null)}
                                disabled={(date) =>
                                  date < new Date() ||
                                  date > new Date(new Date().setMonth(new Date().getMonth() + 2))
                                }
                                initialFocus
                              />
                              <FormMessage />
                            </div>

                            {/* Time grid */}
                            {/* {selectedDate && (
                              <div>
                                <FormLabel>Pick time (30-min steps)</FormLabel>
                                <div className="grid grid-cols-6 gap-2 max-h-[240px] overflow-y-auto border p-2 rounded mt-2">
                                  {times.map((time) => {
                                    const booked = isTimeBooked(time);
                                    const startSelected = form.getValues('startTime') === time;
                                    const endSelected = form.getValues('endTime') === time;
                                    // in-range (between start and end)
                                    const currentStart = form.getValues('startTime');
                                    const currentEnd = form.getValues('endTime');
                                    const inRange = currentStart && currentEnd && time >= currentStart && time < currentEnd;

                                    return (
                                      <button
                                        key={time}
                                        type="button"
                                        disabled={booked}
                                        onClick={() => onTimeClick(time)}
                                        className={`px-2 py-1 rounded text-sm text-left w-full ${
                                          booked ? 'bg-gray-200 text-gray-500 cursor-not-allowed' :
                                          startSelected ? 'bg-blue-600 text-white' :
                                          endSelected ? 'bg-blue-600 text-white' :
                                          inRange ? 'bg-blue-100' :
                                          'bg-green-50 hover:bg-green-100'
                                        }`}
                                      >
                                        {time.slice(0,5)}
                                      </button>
                                    );
                                  })}
                                </div>

                                <div className="mt-2 text-sm text-muted-foreground">
                                  <div>Selected Start: <strong>{form.getValues('startTime') ? form.getValues('startTime').slice(0,5) : '—'}</strong></div>
                                  <div>Selected End: <strong>{form.getValues('endTime') ? form.getValues('endTime').slice(0,5) : '—'}</strong></div>
                                  <div className="text-xs text-gray-500 mt-1">Click a time to set start. Click a later time to set end. Booked slots are disabled.</div>
                                </div>
                              </div>
                            )} */}

{selectedDate && (
  <div>
    <FormLabel>Pick time</FormLabel>
    <TimelineBooking
      bookedSlots={bookedSlots}
      startTime={form.getValues("startTime")}
      endTime={form.getValues("endTime")}
      onChange={(start, end) => {
        form.setValue("startTime", start);
        form.setValue("endTime", end);
      }}
    />
    <div className="mt-2 text-sm text-muted-foreground">
      <div>Selected Start: <strong>{form.getValues('startTime') ? form.getValues('startTime').slice(0,5) : '—'}</strong></div>
      <div>Selected End: <strong>{form.getValues('endTime') ? form.getValues('endTime').slice(0,5) : '—'}</strong></div>
      <div className="text-xs text-gray-500 mt-1">Click a time to set start. Click a later time to set end. Booked slots are disabled.</div>
    </div>
  </div>
)}

                            {/* Notes */}
                            <FormField
                              control={form.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes (optional)</FormLabel>
                                  <FormControl>
                                    <Textarea placeholder="Any special requirements or information" {...field} />
                                  </FormControl>
                                  <FormDescription>Add any additional information for the venue.</FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Terms & TCs */}
                            <FormField
                              control={form.control}
                              name="termsAccepted"
                              render={({ field }) => (
                                <FormItem className="border-t pt-4 mt-4">
                                  <div className="flex items-center gap-2">
                                    <input type="checkbox" id="terms" checked={field.value} onChange={(e) => field.onChange(e.target.checked)} className="w-4 h-4" />
                                    <label htmlFor="terms" className="text-sm">
                                      I accept the{" "}
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <button type="button" className="text-sportyfi-orange underline">Terms & Conditions</button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[500px]">
                                          <DialogHeader>
                                            <DialogTitle>Terms and Conditions</DialogTitle>
                                            <DialogDescription>Please read these carefully before booking:</DialogDescription>
                                          </DialogHeader>
                                          <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto text-sm">
                                            <p>1. Bookings are non-refundable once confirmed.</p>
                                            <p>2. Arrive at least 10 minutes before your slot.</p>
                                            <p>3. Damages to property will be charged.</p>
                                            <p>4. Venue may cancel in case of unforeseen circumstances.</p>
                                            <p>5. Follow venue rules and regulations.</p>
                                          </div>
                                        </DialogContent>
                                      </Dialog>
                                    </label>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <DialogFooter>
                              <Button type="submit" disabled={isBookingPending || !user}>
                                {isBookingPending ? "Submitting..." : "Book Venue"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Venue details and sidebars unchanged */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">About this Venue</h2>
                    <p className="text-muted-foreground">{venue.description || 'No description provided.'}</p>

                    <Separator className="my-6" />

                    <h3 className="text-lg font-semibold mb-4">Sports</h3>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {venue.sports && venue.sports.length > 0 ? (
                        venue.sports.map((sport) => <Badge key={sport} variant="outline">{sport}</Badge>)
                      ) : (
                        <p className="text-muted-foreground">No sports information available</p>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {venue.amenities && venue.amenities.length > 0 ? (
                        venue.amenities.map((amenity) => <Badge key={amenity.id} variant="secondary">{amenity}</Badge>)
                      ) : (
                        <p className="text-muted-foreground">No amenities information available</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-bold mb-4">Booking Details</h2>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <IndianRupee className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <div className="font-semibold">Price</div>
                          <div className="text-sm text-muted-foreground">₹{venue.price_per_hour} per hour</div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <div className="font-semibold">Operating Hours</div>
                          <div className="text-sm text-muted-foreground">6:00 AM - 11:00 PM</div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <div className="font-semibold">Booking Policy</div>
                          <div className="text-sm text-muted-foreground">Book up to 60 days in advance</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-bold mb-4">Contact</h2>
                    <div className="space-y-4">
                      {venue.contact_phone && (
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <div className="font-semibold">Phone</div>
                            <div className="text-sm text-muted-foreground">{venue.contact_phone}</div>
                          </div>
                        </div>
                      )}
                      {venue.contact_email && (
                        <div className="flex items-center">
                          <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                          <div>
                            <div className="font-semibold">Email</div>
                            <div className="text-sm text-muted-foreground">{venue.contact_email}</div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                        <div>
                          <div className="font-semibold">Address</div>
                          <div className="text-sm text-muted-foreground">{venue.location}, {venue.city}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default VenueDetail;

// chatgpt