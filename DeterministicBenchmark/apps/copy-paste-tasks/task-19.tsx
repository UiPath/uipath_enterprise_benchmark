import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen, FileText } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  type: 'category' | 'subcategory' | 'page' | 'subpage';
  level: number;
  children: MenuItem[];
  isExpanded: boolean;
  parentId?: string;
}



class SeededRandom {
  private seed: number;
  constructor(seed: number) { 
    this.seed = seed; 
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export default function Task19() {
  const [menuStructure, setMenuStructure] = useState<MenuItem[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Generate deterministic menu structure
  useEffect(() => {
    const rng = new SeededRandom(12345);
    
    const mainCategories = [
      'Products', 'Services', 'About', 'Support', 'Resources', 'Solutions', 'Company', 'Contact'
    ];

    const subcategoryTemplates = [
      'Overview', 'Features', 'Pricing', 'Documentation', 'Case Studies', 'Gallery', 'Downloads', 'News',
      'Partners', 'Careers', 'Leadership', 'History', 'Mission', 'Values', 'Locations', 'Investors',
      'Press', 'Events', 'Blog', 'FAQ', 'Training', 'Certifications', 'Awards', 'Testimonials', 'Reviews'
    ];

    const pageTemplates = [
      'Getting Started', 'Installation Guide', 'User Manual', 'API Reference', 'Troubleshooting', 
      'Best Practices', 'Release Notes', 'Migration Guide', 'Security Guidelines', 'Performance Tips',
      'Integration Examples', 'Custom Solutions', 'Enterprise Features', 'Mobile App', 'Desktop App',
      'Web Portal', 'Admin Console', 'Analytics Dashboard', 'Reporting Tools', 'Data Export',
      'Backup & Recovery', 'System Requirements', 'Compatibility Matrix', 'Known Issues', 'Roadmap',
      'Feature Requests', 'Bug Reports', 'Community Forum', 'Developer Portal', 'Sample Code',
      'Video Tutorials', 'Webinars', 'Workshops', 'Certification Program', 'Partner Program',
      'Reseller Portal', 'Customer Stories', 'Success Metrics', 'ROI Calculator', 'Cost Analysis',
      'Technical Specifications', 'Deployment Guide', 'Maintenance Schedule', 'Update Procedures', 'Backup Strategy',
      'Monitoring Setup', 'Alert Configuration', 'Performance Metrics', 'Capacity Planning', 'Scaling Guide',
      'Load Balancing', 'Disaster Recovery', 'Business Continuity', 'Compliance Requirements', 'Audit Trail',
      'Data Privacy', 'Terms of Service', 'Privacy Policy', 'Cookie Policy', 'GDPR Compliance'
    ];

    const subpageTemplates = [
      'Version 1.0', 'Version 2.0', 'Version 3.0', 'Beta Release', 'Alpha Release',
      'Configuration A', 'Configuration B', 'Advanced Setup', 'Quick Setup', 'Custom Setup',
      'Windows Guide', 'Mac Guide', 'Linux Guide', 'Mobile Guide', 'Cloud Guide',
      'Step 1', 'Step 2', 'Step 3', 'Prerequisites', 'Post Installation',
      'Example 1', 'Example 2', 'Use Case A', 'Use Case B', 'Implementation Details'
    ];

    const generateMenuStructure = (): MenuItem[] => {
      const structure: MenuItem[] = [];
      let itemIdCounter = 1;

      mainCategories.forEach((categoryName, categoryIndex) => {
        const categoryId = `cat-${itemIdCounter++}`;
        
        // Generate 2-4 subcategories per main category (total 25 subcategories)
        const subcategoryCount = categoryIndex < 1 ? 4 : (categoryIndex < 5 ? 3 : 2); // Distribute to get exactly 25
        const subcategories: MenuItem[] = [];
        
        for (let i = 0; i < subcategoryCount; i++) {
          const subcategoryId = `subcat-${itemIdCounter++}`;
          // For second-to-last category last subcategory, force it to be "Training"
          const subcategoryName = (categoryIndex === 6 && i === subcategoryCount - 1) ? 'Training' : 
            subcategoryTemplates[Math.floor(rng.next() * subcategoryTemplates.length)];
          
          // Generate 6-10 pages per subcategory (total ~60 pages)
          const pageCount = 7 + Math.floor(rng.next() * 4); // 7-10 pages per subcategory
          const pages: MenuItem[] = [];
          
          for (let j = 0; j < pageCount; j++) {
            const pageId = `page-${itemIdCounter++}`;
            // For Training subcategory last page, force it to be "Certification Program"
            const pageName = (categoryIndex === 6 && subcategoryName === 'Training' && j === pageCount - 1) ? 'Certification Program' :
              pageTemplates[Math.floor(rng.next() * pageTemplates.length)];
            
            // Add one 4th level item - specifically in "Training" subcategory of "Company" category and "Certification Program" page
            const subpages: MenuItem[] = [];
            if (categoryIndex === 6 && subcategoryName === 'Training' && pageName === 'Certification Program') {
              const subpageId = `subpage-${itemIdCounter++}`;
              const subpageName = 'Advanced Specialist Track'; // Fixed name for deterministic path
              
              subpages.push({
                id: subpageId,
                name: subpageName,
                type: 'subpage',
                level: 4,
                children: [],
                isExpanded: false,
                parentId: pageId
              });
            }
            
            pages.push({
              id: pageId,
              name: pageName,
              type: 'page',
              level: 3,
              children: subpages,
              isExpanded: false,
              parentId: subcategoryId
            });
          }
          
          subcategories.push({
            id: subcategoryId,
            name: subcategoryName,
            type: 'subcategory',
            level: 2,
            children: pages,
            isExpanded: false,
            parentId: categoryId
          });
        }
        
        structure.push({
          id: categoryId,
          name: categoryName,
          type: 'category',
          level: 1,
          children: subcategories,
          isExpanded: false
        });
      });

      return structure;
    };

    const generated = generateMenuStructure();
    setMenuStructure(generated);
    setIsDataLoaded(true);
  }, []);

  // Expose state for testing
  useEffect(() => {
    if (isDataLoaded) {
      // Flatten structure for counting
      const flattenStructure = (items: MenuItem[]): MenuItem[] => {
        return items.reduce((acc, item) => {
          acc.push(item);
          acc.push(...flattenStructure(item.children));
          return acc;
        }, [] as MenuItem[]);
      };

      // Find the 4th level item and build its path
      const findLevel4Path = (items: MenuItem[], currentPath: string[] = []): string | null => {
        for (const item of items) {
          const newPath = [...currentPath, item.name];
          if (item.level === 4) {
            return newPath.join('/');
          }
          if (item.children.length > 0) {
            const result = findLevel4Path(item.children, newPath);
            if (result) return result;
          }
        }
        return null;
      };

      const allItems = flattenStructure(menuStructure);
      const categories = allItems.filter(item => item.type === 'category');
      const subcategories = allItems.filter(item => item.type === 'subcategory');  
      const pages = allItems.filter(item => item.type === 'page');
      const subpages = allItems.filter(item => item.type === 'subpage');
      const level4Path = findLevel4Path(menuStructure);

      (window as any).app_state = {
        menuStructure,
        allItems,
        categories,
        subcategories,
        pages,
        subpages,
        level4Path,
        expandedNodes: allItems.filter(item => item.isExpanded).map(item => item.id),
        totalItems: allItems.length,
        categoriesCount: categories.length,
        subcategoriesCount: subcategories.length,
        pagesCount: pages.length,
        subpagesCount: subpages.length,
        submission: (window as any).app_state?.submission
      };

      // Console logging for testers (result submission task)
      if (level4Path) {
        const expectedJSON = { path: level4Path };
        console.log('=== EXPECTED JSON (for testers) ===');
        console.log(JSON.stringify(expectedJSON, null, 2));
        console.log('=== COPY-PASTEABLE VERSION ===');
        console.log(JSON.stringify(expectedJSON));
      }
    }
  }, [menuStructure, isDataLoaded]);

  const toggleExpand = (itemId: string) => {
    const updateExpansion = (items: MenuItem[]): MenuItem[] => {
      return items.map(item => {
        if (item.id === itemId) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        return { ...item, children: updateExpansion(item.children) };
      });
    };

    setMenuStructure(updateExpansion(menuStructure));
  };



  const renderMenuItem = (item: MenuItem, depth: number = 0) => {
    const hasChildren = item.children.length > 0;
    const IconComponent = (item.type === 'page' || item.type === 'subpage') ? FileText : (item.isExpanded ? FolderOpen : Folder);
    const paddingLeft = depth * 24;

    return (
      <div key={item.id}>
        <div
          className={`flex items-center py-2 px-3 hover:bg-gray-100 cursor-pointer select-none`}
          style={{ paddingLeft: `${paddingLeft + 12}px` }}
          onClick={() => hasChildren && toggleExpand(item.id)}
        >
          <div className="w-4 h-4 mr-2 flex items-center justify-center">
            {hasChildren ? (
              item.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )
            ) : null}
          </div>
          
          <IconComponent className={`w-4 h-4 mr-2 ${
            item.type === 'category' ? 'text-blue-600' : 
            item.type === 'subcategory' ? 'text-purple-600' : 
            item.type === 'subpage' ? 'text-orange-600' :
            'text-gray-600'
          }`} />
          
          <span className={`text-sm ${
            item.type === 'category' ? 'font-semibold text-gray-900' :
            item.type === 'subcategory' ? 'font-medium text-gray-800' :
            item.type === 'subpage' ? 'font-medium text-orange-800' :
            'text-gray-700'
          }`}>
            {item.name}
          </span>
          
          {item.type === 'category' && (
            <span className="ml-2 text-xs text-gray-500">
              ({item.children.length} items)
            </span>
          )}
        </div>
        
        {item.isExpanded && item.children.map(child => renderMenuItem(child, depth + 1))}
      </div>
    );
  };



  if (!isDataLoaded) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading menu structure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      {/* Main Panel - Menu Tree */}
      <div className="w-full bg-white flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Website Menu Structure</h2>
        </div>
        
        <div className="flex-1 overflow-auto">
          <div className="p-2">
            {menuStructure.map(item => renderMenuItem(item, 0))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500 space-y-1">
            <div>Total Categories: {menuStructure.length}</div>
            <div>Subcategories: {menuStructure.reduce((sum, cat) => sum + cat.children.length, 0)}</div>
            <div>Total Pages: {menuStructure.reduce((sum, cat) => 
              sum + cat.children.reduce((subSum, subcat) => subSum + subcat.children.length, 0), 0)}</div>
            <div>4th Level Items: {menuStructure.reduce((sum, cat) => 
              sum + cat.children.reduce((subSum, subcat) => 
                subSum + subcat.children.reduce((pageSum, page) => pageSum + page.children.length, 0), 0), 0)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
