import BloodMap from "../components/shared/BloodMap";

export default function MapPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Explore Map</h1>
        <p className="text-sm text-slate-500 mt-1">Find nearby blood banks and donors in your area.</p>
      </div>

      <BloodMap showCamps={true} height="400px" />
    </div>
  );
}
