"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useFacilities } from "../../../../hooks/useFacilities";
import { ArrowLeft, Search, Hospital, RefreshCw, Phone, BedDouble, UserCheck } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../../components/ui/table";
import { Badge } from "../../../../components/ui/badge";

export default function AuthorityFacilitiesPage() {
  const { data: facilities, isLoading, refetch, isFetching } = useFacilities();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("All");

  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "All" || f.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [facilities, searchQuery, filterType]);

  if (isLoading && facilities.length === 0) {
    return (
      <div className="min-h-[70vh] w-full flex flex-col items-center justify-center gap-4 text-zinc-400">
        <div className="h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold tracking-wider font-mono">Retrieving facilities inventory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-zinc-150">
      {/* Back Header */}
      <div className="flex items-center justify-between border-b border-zinc-850 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/authority">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full hover:bg-zinc-800 text-zinc-300">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h3 className="text-lg font-black text-white leading-none">Facility & Resource Console (आरोग्य व्यवस्थापन)</h3>
            <p className="text-[10px] text-zinc-400 font-semibold mt-1">Monitor medical tents, bed counts, and clinical staffs</p>
          </div>
        </div>

        {/* Refresh button */}
        <Button 
          onClick={() => refetch()} 
          variant="outline" 
          size="icon" 
          className="h-9 w-9 rounded-xl border-zinc-800 hover:bg-zinc-800 bg-transparent text-primary"
          disabled={isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border border-zinc-850 bg-zinc-900 shadow-xl">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full">
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-zinc-550" />
            <input
              type="text"
              placeholder="Search by facility name or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-2xl py-3 pl-11 pr-4 text-xs text-white placeholder-zinc-550 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2.5 text-xs text-zinc-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="All">All Types</option>
              <option value="FirstAidCamp">First Aid Tents</option>
              <option value="Hospital">Hospitals</option>
              <option value="Ambulance">Ambulances</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Facilities Registry Grid */}
      <Card className="border border-zinc-850 bg-zinc-900 shadow-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-955/40 border-b border-zinc-850">
                <TableRow>
                  <TableHead className="text-xs uppercase text-zinc-450">Facility ID</TableHead>
                  <TableHead className="text-xs uppercase text-zinc-450">Facility Details</TableHead>
                  <TableHead className="text-xs uppercase text-zinc-450">Resource Beds</TableHead>
                  <TableHead className="text-xs uppercase text-zinc-450">On-Duty Doctors</TableHead>
                  <TableHead className="text-xs uppercase text-zinc-450">Status</TableHead>
                  <TableHead className="text-xs uppercase text-zinc-450 text-right">Contacts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFacilities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-20 text-xs text-zinc-500 font-bold">
                      No facilities registered.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredFacilities.map((facility) => {
                    const statusVariant =
                      facility.status === "Active"
                        ? "success"
                        : facility.status === "Busy"
                        ? "warning"
                        : "default";

                    return (
                      <TableRow key={facility.id} className="hover:bg-zinc-850/20 border-b border-zinc-850 last:border-0">
                        {/* ID */}
                        <TableCell className="font-mono text-xs text-zinc-400 font-bold">
                          #{facility.id.split("-")[1]}
                        </TableCell>
                        
                        {/* Name and type */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-950/20 text-blue-400 rounded-xl">
                              <Hospital className="h-4 w-4" />
                            </div>
                            <div>
                              <strong className="text-zinc-100 text-xs font-black block">{facility.name}</strong>
                              <span className="text-[9px] text-zinc-500 font-mono block mt-0.5">
                                Type: {facility.type}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Beds */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                            <BedDouble className="h-4 w-4 text-zinc-550" />
                            <span className="font-extrabold">{facility.bedsAvailable} Beds</span>
                          </div>
                        </TableCell>

                        {/* Doctors */}
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                            <UserCheck className="h-4 w-4 text-zinc-550" />
                            <span className="font-extrabold">{facility.doctorsAvailable} Staffs</span>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Badge variant={statusVariant} className="text-[9px] px-2 py-0.5 font-black uppercase tracking-wider">
                            {facility.status}
                          </Badge>
                        </TableCell>

                        {/* Contact */}
                        <TableCell className="text-right">
                          <a
                            href={`tel:${facility.contactNo}`}
                            className="inline-flex items-center gap-1.5 text-xs text-zinc-300 hover:text-orange-500 font-mono font-bold bg-zinc-950 px-3 py-1.5 border border-zinc-850 rounded-xl"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{facility.contactNo}</span>
                          </a>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
