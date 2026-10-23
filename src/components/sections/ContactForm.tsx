"use client";
import {InlineContent} from "@/components/ui/InlineContent";
import { publicCopy } from "@/app/(site)/data/ApprovedPublicCopy";

import React, { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import CTAButton from "@/components/ui/CTAButton";
import { Toaster, toast } from "sonner";
// Import the server action you created
import { sendEmail } from "@/app/sendEmail"; 

const PLANNING_OPTIONS = ["ENGAGEMENT", "WEDDING", "CHRISTENING", "EDITORIAL"] as const;

const contactSchema = z.object({
  name: z.string().min(1, "NAME IS REQUIRED"),
  location: z.string().min(1, "LOCATION IS REQUIRED"),
    date: z.date({ 
    message: "PLEASE SELECT A DATE" 
  }),

  email: z
    .string()
    .email("ENTER A VALID EMAIL")
    .refine((val) => val.includes("."), {
      message: "EMAIL MUST CONTAIN A DOT (.)",
    }),

  planning: z.enum(PLANNING_OPTIONS, {
    message: "PLEASE SELECT AN OPTION"
  }).optional(),

  phone: z.string().optional(),
  instagram: z.string().optional(),
  message: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

function ErrorMsg({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <span className="absolute -bottom-5 left-0 text-[10px] font-bold text-red-500 uppercase tracking-tighter">
      {message}
    </span>
  );
}

const inputStyles = "w-full bg-transparent text-black text-sm md:text-base outline-none placeholder:text-black/20 uppercase autofill:shadow-[0_0_0_100px_#f9f3f4_inset] autofill:[-webkit-text-fill-color:#1a1a1a]";

export default function ContactForm({previewOnly=false,content={intro:publicCopy.contactIntro,message:publicCopy.contactMessage}}:{content?:{intro:string;message:string;buttonLabel?:string};previewOnly?:boolean}) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPlanningOpen, setIsPlanningOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset, // Added to clear the form
    formState: { isSubmitting, isValid, errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
  });

  const selectedDate = useWatch({ control, name: "date" });
  const selectedPlanning = useWatch({ control, name: "planning" });

  const onSubmit = async (data: ContactFormData) => {
    if (previewOnly) { toast.info("Preview only — no inquiry was submitted."); return; }
    // Format the date for the email body
    const submissionData = {
      ...data,
      date: data.date ? format(data.date, "PPP") : "N/A",
    };

    const sendRequest = async () => {
      const result = await sendEmail(submissionData);
      if (!result.success) throw new Error(result.error);
      return result;
    };

    const toastId=toast.loading("Sending your message...");
    try {
      await sendRequest();
      reset();
      toast.success("Message sent successfully!",{id:toastId});
    } catch(error) {
      toast.error(error instanceof Error?error.message:"Failed to send message.",{id:toastId});
    }
  };

  return (
    <>
      <Toaster position="bottom-left" richColors />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full space-y-5"
        style={{ fontFamily: "var(--font-karena)" }}
      >
        {/* ROW 1: NAME & PLANNING */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 relative ${isPlanningOpen ? 'z-100' : 'z-50'}`}>
          <div className="relative border-b border-ink-black/20 pb-1">
            <label className="block text-sm font-bold tracking-wide text-black mb-1 uppercase">My name is*</label>
            <input 
              {...register("name")} 
              type="text" 
              placeholder="FULL NAME" 
              className={inputStyles} 
            />
            <ErrorMsg message={errors.name?.message} />
          </div>

          <div className="relative border-b border-ink-black/20 pb-1">
            <label className="block text-sm font-bold tracking-wide text-black mb-1 uppercase">and I am planning a</label>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setIsPlanningOpen(!isPlanningOpen);
                setIsCalendarOpen(false);
              }}
              className="w-full cursor-pointer text-sm md:text-base uppercase py-1 flex items-center justify-between text-black"
            >
              <span className={selectedPlanning ? "text-black" : "text-black/20"}>
                {selectedPlanning || "SELECT OPTION"}
              </span>
              <span className={`text-[10px] transition-transform duration-300 ${isPlanningOpen ? "rotate-180" : ""}`}>▼</span>
            </div>
            {isPlanningOpen && (
              <div className="absolute top-full left-0 w-full z-110 mt-1 bg-off-white border border-ink-black/10 shadow-xl overflow-hidden">
                {PLANNING_OPTIONS.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setValue("planning", option, { shouldValidate: true });
                      setIsPlanningOpen(false);
                    }}
                    className="px-4 py-3 text-sm  md:text-sm hover:bg-black hover:text-white transition-colors cursor-pointer uppercase text-black"
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: DATE & LOCATION */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 relative ${isCalendarOpen ? 'z-100' : 'z-40'}`}>
          <div className="relative border-b border-ink-black/20 pb-1">
            <label className="block text-sm font-bold tracking-wide text-black mb-1 uppercase">on (date)*</label>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setIsCalendarOpen(!isCalendarOpen);
                setIsPlanningOpen(false);
              }} 
              className="w-full cursor-pointer text-sm md:text-base uppercase py-1 flex items-center justify-between text-black"
            >
              {selectedDate ? format(selectedDate, "PPP") : <span className="text-black/20">SELECT DATE</span>}
              <span className={`text-[10px] transition-transform duration-300 ${isCalendarOpen ? "rotate-180" : ""}`}>▼</span>
            </div>
            <ErrorMsg message={errors.date?.message} />
            {isCalendarOpen && (
              <div className="absolute top-full left-0 z-110 mt-2 bg-off-white border border-ink-black/10 p-4 shadow-2xl">
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <DayPicker 
                      mode="single" 
                      selected={field.value} 
                      onSelect={(d) => { 
                        field.onChange(d); 
                        setIsCalendarOpen(false); 
                      }} 
                    />
                  )}
                />
              </div>
            )}
          </div>

          <div className="relative border-b border-ink-black/20 pb-1">
            <label className="block text-sm font-bold tracking-wide text-black mb-1 uppercase">in (location)*</label>
            <input 
              {...register("location")} 
              type="text" 
              placeholder="CITY, COUNTRY" 
              className={inputStyles} 
            />
            <ErrorMsg message={errors.location?.message} />
          </div>
        </div>

        {/* ROW 3: EMAIL & PHONE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 relative z-30">
          <div className="relative border-b border-ink-black/20 pb-1">
            <label className="block text-sm font-bold tracking-wide text-black mb-1 uppercase">My email is*</label>
            <input {...register("email")} type="email" placeholder="EMAIL@ADDRESS.COM" className={inputStyles} />
            <ErrorMsg message={errors.email?.message} />
          </div>
          <div className="relative border-b border-ink-black/20 pb-1">
            <label className="block text-sm font-bold tracking-wide text-black mb-1 uppercase">My phone is</label>
            <input
              {...register("phone")}
              type="tel"
              placeholder="NUMBERS ONLY"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setValue("phone", value, { shouldValidate: true });
              }}
              className={inputStyles}
            />
          </div>
        </div>

        {/* ROW 4: INSTAGRAM */}
        <div className="relative border-b border-ink-black/20 pb-1 z-20">
          <label className="block text-sm font-bold tracking-wide text-black mb-1 uppercase">and i&apos;m (@instagram)</label>
          <div className="flex items-center">
            <span className="text-black/20 mr-1 text-sm">@</span>
            <input {...register("instagram")} type="text" placeholder="USERNAME" className={inputStyles} />
          </div>
        </div>

        {/* ROW 5: MESSAGE */}
        <div className="relative border-b border-ink-black/20 pb-1 z-10">
          <label className="block text-sm font-bold tracking-wide text-black mb-1 uppercase">Additional info</label>
          <textarea 
            {...register("message")} 
            placeholder={content.message}
            rows={2} 
            className={`${inputStyles} resize-none pt-1`} 
          />
        </div>

        {/* SUBMIT */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-12 pt-4 relative z-0 items-start md:items-center">
          <div className="w-full md:basis-[40%]">
            <div className={!isValid || isSubmitting ? "opacity-30 grayscale cursor-not-allowed" : "opacity-100"}>
              <CTAButton asButton disabled={!isValid || isSubmitting}>
                {isSubmitting ? "SENDING..." : (content.buttonLabel ?? "SEND MESSAGE")}
              </CTAButton>
            </div>
          </div>
          <div className="w-full md:basis-[60%]">
            <span className="text-[12px] leading-tight uppercase tracking-wider opacity-90 block text-black">
              <InlineContent text={content.intro}/>
            </span>
          </div>
        </div>
      </form>
    </>
  );
}
