import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
    type ReactNode,
} from "react";
import { cn } from "~/lib/utils";

// ==================
// Context
// ==================

interface AccordionContextType {
    activeItems: string[];
    toggleItem: (id: string) => void;
    isItemActive: (id: string) => boolean;
}

const AccordionContext = createContext<AccordionContextType | undefined>(
    undefined
);

const useAccordion = () => {
    const context = useContext(AccordionContext);
    if (!context) {
        throw new Error("Accordion components must be used within <Accordion />");
    }
    return context;
};

// ==================
// Accordion Wrapper
// ==================

interface AccordionProps {
    children: ReactNode;
    defaultOpen?: string[];
    allowMultiple?: boolean;
    className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
    children,
    defaultOpen = [],
    allowMultiple = false,
    className = "",
}) => {
    const [activeItems, setActiveItems] = useState<string[]>(defaultOpen);

    const toggleItem = (id: string) => {
        setActiveItems((prev) => {
            if (allowMultiple) {
                return prev.includes(id)
                    ? prev.filter((item) => item !== id)
                    : [...prev, id];
            }
            return prev.includes(id) ? [] : [id];
        });
    };

    const isItemActive = (id: string) => activeItems.includes(id);

    return (
        <AccordionContext.Provider
            value={{ activeItems, toggleItem, isItemActive }}
        >
            <div className={cn("space-y-2", className)}>{children}</div>
        </AccordionContext.Provider>
    );
};

// ==================
// Accordion Item
// ==================

interface AccordionItemProps {
    id: string;
    children: ReactNode;
    className?: string;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({
    children,
    className = "",
}) => {
    return (
        <div
            className={cn(
                "overflow-hidden border border-gray-200 rounded-xl bg-white",
                className
            )}
        >
            {children}
        </div>
    );
};

// ==================
// Accordion Header
// ==================

interface AccordionHeaderProps {
    itemId: string;
    children: ReactNode;
    className?: string;
    icon?: ReactNode;
    iconPosition?: "left" | "right";
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({
    itemId,
    children,
    className = "",
    icon,
    iconPosition = "right",
}) => {
    const { toggleItem, isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    const defaultIcon = (
        <svg
            className={cn("w-5 h-5 transition-transform duration-300", {
                "rotate-180": isActive,
            })}
            fill="none"
            stroke="#98A2B3"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
            />
        </svg>
    );

    return (
        <button
            onClick={() => toggleItem(itemId)}
            className={cn(
                "w-full px-4 py-4 text-left flex items-center justify-between",
                "transition-colors hover:bg-gray-50",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                className
            )}
        >
            <div className="flex items-center gap-3">
                {iconPosition === "left" && (icon || defaultIcon)}
                <div className="flex-1">{children}</div>
            </div>
            {iconPosition === "right" && (icon || defaultIcon)}
        </button>
    );
};

// ==================
// Accordion Content
// ==================

interface AccordionContentProps {
    itemId: string;
    children: ReactNode;
    className?: string;
}

export const AccordionContent: React.FC<AccordionContentProps> = ({
    itemId,
    children,
    className = "",
}) => {
    const { isItemActive } = useAccordion();
    const isActive = isItemActive(itemId);

    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState(0);

    useEffect(() => {
        if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        }
    }, [children]);

    return (
        <div
            style={{
                height: isActive ? height : 0,
                opacity: isActive ? 1 : 0,
            }}
            className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                className
            )}
        >
            <div ref={contentRef} className="px-4 pb-4">
                {children}
            </div>
        </div>
    );
};
