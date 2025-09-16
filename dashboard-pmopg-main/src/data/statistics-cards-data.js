import {
  BanknotesIcon,
  UserPlusIcon,
  UserIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ArchiveBoxXMarkIcon,
  DocumentDuplicateIcon,
  BookmarkIcon,
  ChatBubbleBottomCenterTextIcon
} from "@heroicons/react/24/solid";

import dashboardService from "@/services/dashboard"

export const statisticsCardsData = [
  // {
  //   color: "purple",
  //   icon: ClipboardDocumentListIcon,
  //   title: "Fresh",
  //   value: "",
  //   footer: {
  //     color: "text-green-500",
  //     value: "+55%",
  //     label: "than last week",
  //   },
  //   getCount: (ministry, from, to) => dashboardService.getFreshCount(ministry, from, to),
  //   tooltip: "Today`s grievances"
  // },
  {
    color: "blue",
    icon: ChatBubbleBottomCenterTextIcon,
    title: "Primary",
    value: "",
    footer: {
      color: "text-green-500",
      value: "+55%",
      label: "than last week",
    },
    getCount: (ministry, from, to) => dashboardService.getPrimaryCount(ministry, from, to),
    tooltip: "Filtered normal grievances"
  },
  {
    color: "red",
    icon: ArchiveBoxXMarkIcon,
    title: "Spam",
    value: "",
    footer: {
      color: "text-green-500",
      value: "+3%",
      label: "than last week",
    },
    getCount: (ministry, from, to) => dashboardService.getSpamCount(ministry, from, to),
    tooltip: "Grievances which have hate speech"
  },
  {
    color: "green",
    icon: DocumentDuplicateIcon,
    title: "Repeat",
    value: "",
    footer: {
      color: "text-red-500",
      value: "-2%",
      label: "than last week",
    },
    getCount: (ministry, from, to) => dashboardService.getRepeatCount(ministry, from, to),
    tooltip: "Grievances which are repeatedly sending same context"
  },
  {
    color: "orange",
    icon: BookmarkIcon,
    title: "Priority",
    value: "",
    footer: {
      color: "text-green-500",
      value: "+5%",
      label: "than last week",
    },
    getCount: (ministry, from, to) => dashboardService.getUrgentCount(ministry, from, to),
    tooltip: "Grievances that need to be addressed on priority"
  },
];

export default statisticsCardsData;
