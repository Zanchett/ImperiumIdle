import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '../stores/gameStore'
import { getItemData, getItemImage } from '../types/items'
import { SALVAGING_RESOURCES } from '../types/salvagingResources'
import { ENGINEERING_RECIPES } from '../types/engineeringResources'
import { FOOD_RESOURCES } from '../types/foodResources'
import { HERB_RESOURCES } from '../types/herbResources'
import { MEDICAL_ITEMS } from '../types/medicalItems'
import './NotificationToast.css'

// Helper function to find resource ID from name
function findResourceIdByName(name: string): string | null {
  // Try all resource types
  const allResources = [
    ...SALVAGING_RESOURCES,
    ...ENGINEERING_RECIPES,
    ...FOOD_RESOURCES,
    ...HERB_RESOURCES,
    ...MEDICAL_ITEMS,
  ]
  
  const resource = allResources.find((r) => r.name === name)
  return resource?.id || null
}

// Helper function to extract resource name and icon from notification message
function parseNotification(message: string): { resourceId: string | null; displayText: string } {
  // Pattern: "Resource Name +X" or "Resource Name +X (extra text)"
  const match = message.match(/^(.+?)\s+\+(\d+)(?:\s+\((.+)\))?$/)
  if (match) {
    const resourceName = match[1].trim()
    const resourceId = findResourceIdByName(resourceName)
    return { resourceId, displayText: message }
  }
  
  // Pattern: "Bought Xx Resource Name" or "Sold Xx Resource Name"
  const tradeMatch = message.match(/(?:Bought|Sold)\s+\d+x\s+(.+?)\s+(?:from|to)/)
  if (tradeMatch) {
    const resourceName = tradeMatch[1].trim()
    const resourceId = findResourceIdByName(resourceName)
    return { resourceId, displayText: message }
  }
  
  // Pattern: "Knowledge +1 (Rarity Name)"
  if (message.includes('Knowledge')) {
    return { resourceId: null, displayText: message }
  }
  
  return { resourceId: null, displayText: message }
}

export default function NotificationToast() {
  const { notifications, removeNotification } = useGameStore()
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Set up timers for new notifications
    notifications.forEach((notification) => {
      if (!timersRef.current.has(notification.id)) {
        // New notification - set up timer
        const age = Date.now() - notification.timestamp
        const remainingTime = Math.max(0, 1900 - age) // Remove slightly before animation ends
        
        const timer = setTimeout(() => {
          setRemovingIds((prev) => {
            const newSet = new Set(prev)
            newSet.add(notification.id)
            return newSet
          })
          // Remove from store after a tiny delay to ensure it's hidden
          setTimeout(() => {
            removeNotification(notification.id)
            setRemovingIds((prev) => {
              const newSet = new Set(prev)
              newSet.delete(notification.id)
              return newSet
            })
          }, 100)
          
          timersRef.current.delete(notification.id)
        }, remainingTime)
        
        timersRef.current.set(notification.id, timer)
      }
    })

    // Clean up timers for removed notifications
    const currentIds = new Set(notifications.map((n) => n.id))
    timersRef.current.forEach((timer, id) => {
      if (!currentIds.has(id)) {
        clearTimeout(timer)
        timersRef.current.delete(id)
      }
    })

    return () => {
      // Cleanup on unmount
      timersRef.current.forEach((timer) => clearTimeout(timer))
      timersRef.current.clear()
    }
  }, [notifications, removeNotification])

  // Filter out notifications that are being removed
  const visibleNotifications = notifications.filter(
    (notification) => !removingIds.has(notification.id)
  )

  return (
    <div className="notification-container">
      {visibleNotifications.map((notification) => {
        const { resourceId, displayText } = parseNotification(notification.message)
        const resourceData = resourceId ? getItemData(resourceId) : null
        const iconPath = resourceId ? getItemImage(resourceId) : null
        
        return (
          <div key={notification.id} className="notification-toast">
            {iconPath && (
              <div className="notification-icon">
                <img src={iconPath} alt={resourceData?.name || 'Resource'} />
                <div className="notification-icon-glitch"></div>
              </div>
            )}
            <span className="notification-text">
              <span className="notification-text-content">{displayText}</span>
              <span className="notification-text-glitch">{displayText}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
