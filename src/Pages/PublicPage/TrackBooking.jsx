import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import GuestLayout from "../../Layouts/GuestLayout";
import { useMutation } from "@tanstack/react-query";
import { $api } from "../../api/client";

const TrackBooking = () => {
  const [referenceNumber, setReferenceNumber] = useState("");

  const { mutate, data, isPending, isError, error, reset } = useMutation({
    mutationFn: (referenceNumber) =>
      $api(`/public/track-booking/${referenceNumber}`),
    onError: (err) => console.log("ofetch error data:", err.data),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!referenceNumber.trim()) return;
    mutate(referenceNumber.trim());
  };

  const job = data;

  return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden flex flex-col">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-teal-600/10 blur-[140px] pointer-events-none" />
        <GuestLayout/>
        <div className="relative z-10 max-w-2xl mx-auto w-full px-6 py-16 flex-1">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-semibold tracking-tight mb-2"
          >
            Track Your Repair Booking
          </motion.h1>
          <p className="text-slate-400 mb-8">
            Enter your reference number to check the status of your repair.
          </p>

          <form onSubmit={handleSubmit} className="flex gap-3 mb-10">
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => {
                setReferenceNumber(e.target.value);
                if (data || isError) reset();
              }}
              placeholder="e.g. JAP-VNVIYG4C"
              className="flex-1 rounded-xl bg-slate-900/70 border border-slate-800 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
            />
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-medium px-6 py-3 transition-colors"
            >
              {isPending ? "Searching..." : "Track"}
            </button>
          </form>

          <AnimatePresence mode="wait">
            {isError && (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3"
              >
                {error?.data?.message ||
                  error?.data?.errors?.reference_number?.[0] ||
                  "Reference number not found."}
              </motion.div>
            )}

            {job && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur p-6 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium">
                    Reference: {job.reference_number}
                  </h2>
                  <span className="text-xs uppercase tracking-wide bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full">
                    {job.status}
                  </span>
                </div>

                {job.vehicle && (
                  <div>
                    <h3 className="text-sm text-slate-400 mb-1">Vehicle</h3>
                    <p>
                      {job.vehicle.brand} {job.vehicle.model}{" "}
                      <span className="text-slate-500 text-sm">
                        ({job.vehicle.body_type}, {job.vehicle.transmission})
                      </span>
                    </p>
                    <p className="text-slate-400 text-sm">
                      Plate {job.vehicle.plate_number} &middot; Chassis{" "}
                      {job.vehicle.chassis_number}
                    </p>
                  </div>
                )}

                {job.customer_information && (
                  <div>
                    <h3 className="text-sm text-slate-400 mb-1">Customer</h3>
                    <p>
                      {job.customer_information.first_name}{" "}
                      {job.customer_information.last_name}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {job.customer_information.email} &middot;{" "}
                      {job.customer_information.phone_number}
                    </p>
                  </div>
                )}

                {job.repair_job_services?.length > 0 && (
                  <div>
                    <h3 className="text-sm text-slate-400 mb-2">Services</h3>
                    <div className="space-y-4">
                      {job.repair_job_services.map((rjs) => {
                        const serviceMeta = job.services?.find(
                          (s) => s.id === rjs.service_id
                        );
                        return (
                          <div key={rjs.id}>
                            <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-1">
                              <span>{serviceMeta?.name}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-slate-400">
                                  {rjs.status}
                                </span>
                                <span className="font-medium">
                                  ₱{Number(rjs.actual_price).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            {rjs.items?.length > 0 && (
                              <ul className="pl-3 mt-1 space-y-0.5">
                                {rjs.items.map((item) => (
                                  <li
                                    key={item.id}
                                    className="flex justify-between text-xs text-slate-500"
                                  >
                                    <span>
                                      {item.inventory?.item_name}{" "}
                                      <span className="text-slate-600">
                                        ({item.inventory?.quantity_in_stock}{" "}
                                        {item.inventory?.unit} in stock)
                                      </span>
                                    </span>
                                    <span>
                                      ₱{Number(item.unit_price).toLocaleString()}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {job.total_estimated_cost && (
                  <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                    <span className="text-slate-400 text-sm">
                      Estimated total
                    </span>
                    <span className="text-lg font-medium">
                      ₱{Number(job.total_estimated_cost).toLocaleString()}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
  );
};

export default TrackBooking;