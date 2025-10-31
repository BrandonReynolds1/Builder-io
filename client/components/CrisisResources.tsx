import React from "react";

type Props = {
  className?: string;
};

export default function CrisisResources({ className = "" }: Props) {
  return (
    <div
      className={`border-l-4 border-red-500 bg-red-50/70 p-4 rounded-md shadow-sm ${className}`}
      role="region"
      aria-labelledby="crisis-heading"
    >
      <h3 id="crisis-heading" className="text-lg font-bold text-red-950 mb-2">
        If you feel unsafe or that you may be in danger
      </h3>

      <p className="text-sm text-red-950/90 font-medium mb-3">
        If anyone is at risk of harming themselves or others, call 911 right now.
      </p>

      <div className="space-y-4">
        <div className="bg-white/80 border border-red-200 rounded-md p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-semibold text-red-950 text-base">988 — Suicide & Crisis Lifeline</p>
          <p className="text-sm text-red-950/90 mt-1">
            Call or text <a className="underline font-medium hover:text-red-700 transition-colors" href="tel:988">988</a>, or visit{' '}
            <a
              className="underline font-medium hover:text-red-700 transition-colors"
              href="https://988lifeline.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              988 Lifeline
            </a>
            .
          </p>
        </div>

        <div className="bg-white/80 border border-red-200 rounded-md p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-semibold text-red-950 text-base">SAMHSA National Helpline</p>
          <p className="text-sm text-red-950/90 mt-1">
            Confidential, free help for people facing substance use or mental
            health crises. Call 1-800-662-HELP (4357) or visit{' '}
            <a
              className="underline font-medium hover:text-red-700 transition-colors"
              href="https://www.samhsa.gov/find-help/national-helpline"
              target="_blank"
              rel="noopener noreferrer"
            >
              SAMHSA
            </a>
            .
          </p>
        </div>

        <div className="bg-white/80 border border-red-200 rounded-md p-3 shadow-sm hover:shadow-md transition-shadow">
          <p className="font-semibold text-red-950 text-base">NAMI (National Alliance on Mental Illness)</p>
          <p className="text-sm text-red-950/90 mt-1">
            Support, education, and resources. Call the NAMI HelpLine at
            1-800-950-NAMI (6264) or visit{' '}
            <a
              className="underline font-medium hover:text-red-700 transition-colors"
              href="https://www.nami.org/Support-Education"
              target="_blank"
              rel="noopener noreferrer"
            >
              NAMI Help
            </a>
            .
          </p>
        </div>

        <p className="text-sm text-red-950/90 mt-2 px-3">
          If you'd like immediate local resources, you can search the SAMHSA
          treatment locator or call the numbers above for confidential help.
        </p>
      </div>
    </div>
  );
}
